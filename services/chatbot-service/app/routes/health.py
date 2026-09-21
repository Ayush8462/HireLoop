import time
from typing import Any, Dict
from fastapi import APIRouter
from app.agent.pipeline import default_pipeline
from app.config import settings

router = APIRouter(prefix="", tags=["Health & Stats"])


@router.get("/health", summary="Health check endpoint")
async def health_check() -> Dict[str, Any]:
    """Returns service health status."""
    return {
        "status": "healthy",
        "service": "chatbot-service",
        "initialized": default_pipeline.is_initialized,
        "timestamp": time.time(),
    }


@router.get("/stats", summary="Knowledge base statistics")
async def get_stats() -> Dict[str, Any]:
    """Returns statistics about indexed knowledge documents and retrieval configuration."""
    vector_store = default_pipeline.retriever.vector_store
    return {
        "indexed_chunks": vector_store.count(),
        "vector_dimension": default_pipeline.retriever.embedder.dimension,
        "hybrid_alpha": default_pipeline.retriever.alpha,
        "similarity_threshold": settings.SIMILARITY_THRESHOLD,
        "top_k_chunks": settings.TOP_K_CHUNKS,
        "model_name": settings.MODEL_NAME,
        "has_gemini_key": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip()),
    }
