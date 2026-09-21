import logging
from typing import Dict, List
from fastapi import APIRouter, HTTPException, status
from app.models.chat import ChatRequest, ChatResponse
from app.agent.pipeline import default_pipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["Chatbot"])

DEFAULT_CATEGORIZED_SUGGESTIONS: Dict[str, List[str]] = {
    "Company Roadmaps": [
        "What is the Google SDE interview roadmap?",
        "How do I prepare for Microsoft Codility OA?",
        "Explain the Amazon SDE 1 hiring process and Bar Raiser",
        "What is Flipkart's Machine Coding round?",
    ],
    "Core CS & Placements": [
        "Explain Process vs Thread and Context Switching",
        "What are ACID properties and Database Indexing?",
        "Difference between TCP and UDP with real examples",
        "How do I get referrals off-campus?",
    ],
    "Subjective & Behavioral": [
        "How do I use the STAR method in interviews?",
        "How should I answer 'Tell me about yourself'?",
        "What are Amazon's 14 Leadership Principles?",
        "What questions should I ask the interviewer?",
    ],
    "HireLoop Platform Guide": [
        "How do I book a mock interview with a senior?",
        "How does the ATS Resume Scanner calculate score?",
        "How can I request a job referral on HireLoop?",
        "Where can I upload or update my official resume?",
    ],
}


@router.post("/chat", response_model=ChatResponse, summary="Send a message to the AI Career Agent")
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """Processes user queries via hybrid RAG retrieval and ML reasoning."""
    try:
        response = default_pipeline.process_message(request)
        return response
    except Exception as e:
        logger.error(f"Error processing chat message: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating the response: {str(e)}",
        )


@router.get("/suggestions", summary="Get suggested starter questions")
async def suggestions_endpoint() -> Dict[str, List[str]]:
    """Returns curated starter prompts categorized by topic."""
    return DEFAULT_CATEGORIZED_SUGGESTIONS
