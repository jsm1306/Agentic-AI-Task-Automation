"""
Autonomous Academic AI Assistant Backend
FastAPI application with CrewAI integration for academic assistance
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
from crewai import Crew, Agent, Task
import uuid
from datetime import datetime
from pathlib import Path
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our modules
try:
    from .agents import get_academic_agent, create_task_for_message
    from .models import (
        ChatRequest, ChatResponse, SessionCreate, SessionResponse,
        ArtifactResponse, SaveNotesRequest, UpdateProgressRequest
    )
    from .storage import FileStorage
    from .cache import SimpleCache
    from .logger import AgentLogger
except ImportError:
    # Handle case when run as standalone script
    from agents import get_academic_agent, create_task_for_message
    from models import (
        ChatRequest, ChatResponse, SessionCreate, SessionResponse,
        ArtifactResponse, SaveNotesRequest, UpdateProgressRequest
    )
    from storage import FileStorage
    from cache import SimpleCache
    from logger import AgentLogger

# Initialize FastAPI app
app = FastAPI(
    title="Academic AI Assistant API",
    description="Autonomous Academic AI Assistant with CrewAI integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
storage = FileStorage()
cache = SimpleCache()
logger = AgentLogger()

# Configure Google Generative AI if API key is available
gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if gemini_api_key:
    try:
        import google.genai as genai
        genai.configure(api_key=gemini_api_key)
        logger.info("Google Generative AI configured successfully")
    except ImportError:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_api_key)
            logger.info("Google Generative AI configured successfully (using deprecated package)")
        except ImportError:
            logger.warning("google-generativeai package not available")
        except Exception as e:
            logger.error(f"Failed to configure Google Generative AI: {e}")
    except Exception as e:
        logger.error(f"Failed to configure Google Generative AI: {e}")

# Check if we have API keys, enable mock mode if not
MOCK_MODE = not gemini_api_key
if MOCK_MODE:
    logger.info("Running in MOCK MODE - No API keys detected")
else:
    logger.info("Running with API keys - Full AI functionality enabled")

@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    # Ensure data directories exist
    storage.ensure_directories()
    logger.info("Academic AI Assistant backend started")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Academic AI Assistant Backend", "status": "running"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "mode": "mock" if MOCK_MODE else "full_ai",
        "components": {
            "storage": "ready",
            "cache": "ready",
            "agents": "mock_ready" if MOCK_MODE else "ready"
        }
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, background_tasks: BackgroundTasks):
    """Main chat endpoint with streaming support"""
    try:
        # Validate session exists
        if not storage.session_exists(request.session_id):
            raise HTTPException(status_code=404, detail="Session not found")

        # Check cache first
        cache_key = f"chat:{request.session_id}:{hash(request.message)}"
        cached_response = cache.get(cache_key)
        if cached_response:
            logger.info(f"Cache hit for session {request.session_id}")
            return ChatResponse(**cached_response)

        # Handle mock mode
        if MOCK_MODE:
            logger.info(f"Mock response for session {request.session_id}")
            mock_response = {
                "session_id": request.session_id,
                "response": f"I understand you want to discuss: '{request.message}'. This is a mock response since no API keys are configured. Please set up your GEMINI_API_KEY in the .env file to enable full AI functionality.",
                "timestamp": datetime.now().isoformat(),
                "agent_actions": [
                    {
                        "timestamp": datetime.now().isoformat(),
                        "action": "MOCK_RESPONSE",
                        "details": {"message": "Mock AI response generated"}
                    }
                ]
            }

            # Cache the response
            cache.set(cache_key, mock_response, ttl=3600)

            # Update session
            storage.add_message_to_session(
                request.session_id,
                {"role": "user", "content": request.message, "timestamp": mock_response["timestamp"]}
            )
            storage.add_message_to_session(
                request.session_id,
                {"role": "assistant", "content": mock_response["response"], "timestamp": mock_response["timestamp"]}
            )

            return ChatResponse(**mock_response)

        # Get academic agent for this session
        agent = get_academic_agent(request.session_id)

        # Create task for the user message
        task = create_task_for_message(request.message, request.session_id)

        # Create crew with the task
        crew = Crew(
            agents=[agent],
            tasks=[task],
            process="sequential",
            verbose=False
        )

        # Execute the task
        logger.info(f"Processing chat request for session {request.session_id}")
        result = crew.kickoff()

        # Parse the result
        response_data = {
            "session_id": request.session_id,
            "response": str(result),
            "timestamp": datetime.now().isoformat(),
            "agent_actions": logger.get_recent_actions(request.session_id)
        }

        # Cache the response
        cache.set(cache_key, response_data, ttl=3600)  # Cache for 1 hour

        # Update session with new message
        storage.add_message_to_session(
            request.session_id,
            {"role": "user", "content": request.message, "timestamp": response_data["timestamp"]}
        )
        storage.add_message_to_session(
            request.session_id,
            {"role": "assistant", "content": response_data["response"], "timestamp": response_data["timestamp"]}
        )

        return ChatResponse(**response_data)

    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/sessions", response_model=List[SessionResponse])
async def get_sessions():
    """Get all chat sessions"""
    try:
        sessions = storage.get_all_sessions()
        return sessions
    except Exception as e:
        logger.error(f"Get sessions error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sessions")

@app.post("/session", response_model=SessionResponse)
async def create_session(request: SessionCreate):
    """Create a new chat session"""
    try:
        session_id = str(uuid.uuid4())
        session_data = {
            "id": session_id,
            "title": request.title or f"Session {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            "subject": request.subject,
            "created_at": datetime.now().isoformat(),
            "messages": [],
            "artifacts": {
                "study_plans": [],
                "notes": [],
                "progress": [],
                "memory": {}
            }
        }

        storage.save_session(session_data)
        logger.info(f"Created new session: {session_id}")

        return SessionResponse(**session_data)

    except Exception as e:
        logger.error(f"Create session error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create session")

@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a chat session and all its data"""
    try:
        if not storage.session_exists(session_id):
            raise HTTPException(status_code=404, detail="Session not found")

        success = storage.delete_session(session_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete session")

        logger.info(f"Deleted session: {session_id}")
        return {"message": "Session deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete session error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete session")

@app.get("/artifacts/{session_id}", response_model=ArtifactResponse)
async def get_artifacts(session_id: str):
    """Get artifacts for a specific session"""
    try:
        if not storage.session_exists(session_id):
            raise HTTPException(status_code=404, detail="Session not found")

        artifacts = storage.get_session_artifacts(session_id)
        return artifacts

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get artifacts error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve artifacts")

@app.post("/save-notes")
async def save_notes(request: SaveNotesRequest):
    """Save notes for a session"""
    try:
        if not storage.session_exists(request.session_id):
            raise HTTPException(status_code=404, detail="Session not found")

        # Save notes using the academic agent
        agent = get_academic_agent(request.session_id)

        task = Task(
            description=f"Save these notes: {request.content}",
            expected_output="Notes saved successfully.",
            agent=agent
        )

        crew = Crew(agents=[agent], tasks=[task])
        result = crew.kickoff()
        storage.save_notes(request.session_id, request.content, request.title)

        return {"message": "Notes saved successfully", "result": str(result)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Save notes error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save notes")

@app.post("/update-progress")
async def update_progress(request: UpdateProgressRequest):
    """Update progress for a session"""
    try:
        if not storage.session_exists(request.session_id):
            raise HTTPException(status_code=404, detail="Session not found")

        # Update progress using the academic agent
        agent = get_academic_agent(request.session_id)

        task = Task(
            description=f"Update progress: {request.progress_text}",
            expected_output="Progress updated successfully.",
            agent=agent
        )

        crew = Crew(agents=[agent], tasks=[task])
        result = crew.kickoff()
        storage.update_progress(request.session_id, request.progress_text)

        return {"message": "Progress updated successfully", "result": str(result)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update progress error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update progress")

@app.get("/agent-logs/{session_id}")
async def get_agent_logs(session_id: str):
    """Get agent action logs for a session"""
    try:
        logs = logger.get_recent_actions(session_id)
        return {"logs": logs}
    except Exception as e:
        logger.error(f"Get agent logs error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve agent logs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)