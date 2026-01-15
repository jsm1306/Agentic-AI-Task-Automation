"""
Streaming utilities for real-time AI responses
"""

import json
from typing import AsyncGenerator
from fastapi.responses import StreamingResponse
import asyncio

async def stream_ai_response(response_generator: AsyncGenerator[str, None]):
    """Stream AI response as Server-Sent Events"""
    async def generate():
        try:
            async for chunk in response_generator:
                # Format as SSE
                data = json.dumps({
                    "type": "chunk",
                    "content": chunk,
                    "timestamp": asyncio.get_event_loop().time()
                })
                yield f"data: {data}\n\n"
                await asyncio.sleep(0.01)  # Small delay to prevent overwhelming client

            # Send completion event
            completion_data = json.dumps({
                "type": "complete",
                "timestamp": asyncio.get_event_loop().time()
            })
            yield f"data: {completion_data}\n\n"

        except Exception as e:
            error_data = json.dumps({
                "type": "error",
                "error": str(e),
                "timestamp": asyncio.get_event_loop().time()
            })
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        }
    )

def create_mock_stream_response(text: str, delay: float = 0.1) -> AsyncGenerator[str, None]:
    """Create a mock streaming response for testing"""
    async def generate():
        words = text.split()
        for word in words:
            yield word + " "
            await asyncio.sleep(delay)
    return generate()

def format_agent_action_stream(action: str, details: dict = None) -> str:
    """Format agent action for streaming"""
    return json.dumps({
        "type": "agent_action",
        "action": action,
        "details": details or {},
        "timestamp": asyncio.get_event_loop().time()
    })