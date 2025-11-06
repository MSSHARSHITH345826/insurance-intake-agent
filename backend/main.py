from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

from services.chat_service import ChatService

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="SunLife Insurance Intake Portal API",
    description="Backend API for SunLife Insurance Claims Processing",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3030", 
        "http://localhost:3031", 
        "http://localhost:5173",
        "http://localhost:8004"  # Backend port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize chat service
chat_service = ChatService()

# Request/Response models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[ChatMessage]] = []
    context_type: Optional[str] = "dashboard"  # "dashboard" or "document"
    document_id: Optional[int] = None
    claims_data: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    success: bool
    response: Optional[str] = None
    error: Optional[str] = None

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SunLife Insurance Intake Portal API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "chat_service_configured": chat_service.configured
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint for interacting with dashboard data and documents
    """
    try:
        # Call chat service
        result = chat_service.chat(
            user_message=request.message,
            chat_history=[{"role": msg.role, "content": msg.content} for msg in request.chat_history],
            context_type=request.context_type,
            document_id=request.document_id,
            claims_data=request.claims_data
        )
        
        return ChatResponse(
            success=result.get("success", False),
            response=result.get("response"),
            error=result.get("error")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

