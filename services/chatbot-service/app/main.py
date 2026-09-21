import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware # type: ignore

from app.config import settings
from app.agent.pipeline import default_pipeline
from app.routes.chat import router as chat_router
from app.routes.health import router as health_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("chatbot_service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle handler."""
    logger.info("Starting HireLoop AI Chatbot & RAG Service...")
    # Initialize knowledge base & hybrid indices
    try:
        default_pipeline.initialize()
        logger.info("Hybrid vector and BM25 indices loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize ChatAgentPipeline: {e}", exc_info=True)
    yield
    logger.info("Shutting down HireLoop AI Chatbot Service...")


app = FastAPI(
    title="HireLoop AI Career Agent & Chatbot Service",
    description="Intelligent RAG-powered career mentor, interview roadmap advisor, and platform guide for HireLoop.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware - allow any web origin while dynamically reflecting Origin header for credentials
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes under both `/api/chatbot` (standard gateway prefix) and `/` (direct service call)
app.include_router(health_router, prefix="/api/chatbot")
app.include_router(chat_router, prefix="/api/chatbot")

app.include_router(health_router, prefix="")
app.include_router(chat_router, prefix="")


if __name__ == "__main__":
    import uvicorn # type: ignore

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=(settings.ENVIRONMENT == "development"),
    )
