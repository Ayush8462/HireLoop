from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessage(BaseModel):
    role: MessageRole
    content: str


class SourceCitation(BaseModel):
    id: str
    title: str
    category: str
    similarity: float
    snippet: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User's query")
    history: Optional[List[ChatMessage]] = Field(
        default_factory=list, description="Conversation context"
    )
    user_role: Optional[str] = Field(
        default="guest", description="Role of the visitor: student, senior, guest"
    )


class ChatResponse(BaseModel):
    success: bool = True
    answer: str
    intent: str
    citations: List[SourceCitation] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)
    meta: Dict[str, Any] = Field(default_factory=dict)
