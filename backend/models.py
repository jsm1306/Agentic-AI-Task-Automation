"""
Pydantic models for the Academic AI Assistant API
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    session_id: str = Field(..., description="ID of the chat session")
    message: str = Field(..., description="User message to process")
    stream: bool = Field(default=False, description="Whether to stream the response")

class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    session_id: str
    response: str
    timestamp: str
    agent_actions: List[Dict[str, Any]] = Field(default_factory=list)

class SessionCreate(BaseModel):
    """Request model for creating a new session"""
    title: Optional[str] = Field(None, description="Optional title for the session")
    subject: str = Field(..., description="Subject/topic for the session")

class SessionResponse(BaseModel):
    """Response model for session data"""
    id: str
    title: str
    subject: str
    created_at: str
    messages: List[Dict[str, Any]] = Field(default_factory=list)
    artifacts: Dict[str, Any] = Field(default_factory=dict)

class ArtifactResponse(BaseModel):
    """Response model for session artifacts"""
    session_id: str
    study_plans: List[Dict[str, Any]] = Field(default_factory=list)
    notes: List[Dict[str, Any]] = Field(default_factory=list)
    progress: List[Dict[str, Any]] = Field(default_factory=list)
    memory: Dict[str, Any] = Field(default_factory=dict)

class SaveNotesRequest(BaseModel):
    """Request model for saving notes"""
    session_id: str
    title: str
    content: str

class UpdateProgressRequest(BaseModel):
    """Request model for updating progress"""
    session_id: str
    progress_text: str

class AgentAction(BaseModel):
    """Model for agent actions logging"""
    session_id: str
    action: str
    timestamp: str
    details: Dict[str, Any] = Field(default_factory=dict)

class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    message: str
    timestamp: str