from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.document import RetrievalResult


class IntentType(str, Enum):
    ROADMAP_QUERY = "roadmap_query"
    PLACEMENT_PREPARATION = "placement_preparation"
    SUBJECTIVE_INTERVIEW = "subjective_interview"
    PLATFORM_FEATURE = "platform_feature"
    CHITCHAT_OR_GREETING = "chitchat_or_greeting"
    GENERAL_QUERY = "general_query"


class AgentStep(BaseModel):
    step_name: str
    detail: str
    timestamp: float


class AgentState(BaseModel):
    query: str
    intent: IntentType
    retrieved_documents: List[RetrievalResult] = Field(default_factory=list)
    filtered_context: str = ""
    steps: List[AgentStep] = Field(default_factory=list)
    final_answer: Optional[str] = None
