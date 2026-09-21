from enum import Enum
from typing import Any, Dict, List
from pydantic import BaseModel, Field


class KnowledgeCategory(str, Enum):
    COMPANY_ROADMAP = "company_roadmap"
    JOBS_AND_PLACEMENTS = "jobs_and_placements"
    SUBJECTIVE_INTERVIEW = "subjective_interview"
    PLATFORM_GUIDE = "platform_guide"
    GENERAL_FAQ = "general_faq"


class DocumentChunk(BaseModel):
    id: str
    title: str
    category: KnowledgeCategory
    content: str
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RetrievalResult(BaseModel):
    chunk: DocumentChunk
    similarity_score: float
    dense_score: float
    sparse_score: float
    rank: int
