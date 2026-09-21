import time
import logging
from typing import Optional, List

from app.config import settings
from app.models.chat import ChatRequest, ChatResponse
from app.models.agent_state import AgentState, AgentStep, IntentType
from app.agent.router import default_router, IntentRouter
from app.agent.generator import default_generator, ResponseGenerator
from app.ml.hybrid_retriever import HybridRetriever
from app.ml.reranker import SemanticReranker
from app.ml.embeddings import default_embedder
from app.ml.vector_store import default_vector_store
from app.knowledge.loader import default_loader

logger = logging.getLogger(__name__)


class ChatAgentPipeline:
    """The central orchestrator for the HireLoop AI RAG Agent."""

    def __init__(
        self,
        retriever: Optional[HybridRetriever] = None,
        reranker: Optional[SemanticReranker] = None,
        router: Optional[IntentRouter] = None,
        generator: Optional[ResponseGenerator] = None,
    ):
        self.router = router or default_router
        self.generator = generator or default_generator
        self.reranker = reranker or SemanticReranker()
        self.retriever = retriever or HybridRetriever(
            embedder=default_embedder,
            vector_store=default_vector_store,
        )
        self.is_initialized = False

    def initialize(self) -> None:
        """Loads knowledge base and constructs the hybrid index."""
        logger.info("Initializing ChatAgentPipeline: loading knowledge documents...")
        start_time = time.time()
        chunks = default_loader.load_all()
        logger.info(f"Indexing {len(chunks)} chunks in hybrid dense+sparse retriever...")
        self.retriever.build_index(chunks)
        self.is_initialized = True
        logger.info(f"ChatAgentPipeline initialization completed in {time.time() - start_time:.3f}s")

    def process_message(self, request: ChatRequest) -> ChatResponse:
        """Executes the full agent reasoning, retrieval, and generation cycle."""
        start_time = time.time()
        steps: List[AgentStep] = []

        query = request.message.strip()

        # Step 1: Intent Classification
        t0 = time.time()
        intent, confidence = self.router.route(query)
        steps.append(
            AgentStep(
                step_name="intent_classification",
                detail=f"Intent: {intent.value} (Confidence: {confidence:.2f})",
                timestamp=time.time() - t0,
            )
        )

        # Fast path for greeting
        if intent == IntentType.CHITCHAT_OR_GREETING:
            answer, citations, followups = self.generator.generate(
                query=query,
                retrieved_results=[],
                intent=intent,
                history=request.history,
            )
            return ChatResponse(
                success=True,
                answer=answer,
                intent=intent.value,
                citations=[],
                suggested_followups=followups,
                meta={
                    "intent_confidence": confidence,
                    "execution_time_ms": round((time.time() - start_time) * 1000, 2),
                },
            )

        # Step 2: Hybrid Retrieval (Dense Vector + BM25 Lexical)
        t1 = time.time()
        raw_candidates = self.retriever.retrieve(
            query=query,
            top_k=settings.TOP_K_CHUNKS,
            min_threshold=settings.SIMILARITY_THRESHOLD,
        )
        steps.append(
            AgentStep(
                step_name="hybrid_retrieval",
                detail=f"Retrieved {len(raw_candidates)} candidate chunks",
                timestamp=time.time() - t1,
            )
        )

        # Step 3: Semantic Multi-Feature Re-ranking
        t2 = time.time()
        reranked_results = self.reranker.rerank(
            query=query,
            candidates=raw_candidates,
            intent=intent,
            top_k=3,
        )
        steps.append(
            AgentStep(
                step_name="reranking",
                detail=f"Selected top {len(reranked_results)} reranked chunks",
                timestamp=time.time() - t2,
            )
        )

        # Step 4: Grounded Response Generation
        t3 = time.time()
        answer, citations, followups = self.generator.generate(
            query=query,
            retrieved_results=reranked_results,
            intent=intent,
            history=request.history,
        )
        steps.append(
            AgentStep(
                step_name="generation",
                detail=f"Synthesized response with {len(citations)} citations",
                timestamp=time.time() - t3,
            )
        )

        total_time_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(
            f"Processed query='{query[:40]}...' in {total_time_ms}ms | intent={intent.value} | chunks={len(reranked_results)}"
        )

        return ChatResponse(
            success=True,
            answer=answer,
            intent=intent.value,
            citations=citations,
            suggested_followups=followups,
            meta={
                "intent_confidence": confidence,
                "chunks_retrieved": len(reranked_results),
                "execution_time_ms": total_time_ms,
            },
        )


default_pipeline = ChatAgentPipeline()
