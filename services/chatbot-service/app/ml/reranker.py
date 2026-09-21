import re
from typing import List, Optional
from app.models.document import RetrievalResult
from app.models.agent_state import IntentType


class SemanticReranker:
    """Re-ranks retrieved candidate chunks using multi-feature semantic relevance scoring."""

    def __init__(self, title_weight: float = 0.25, phrase_weight: float = 0.20):
        self.title_weight = title_weight
        self.phrase_weight = phrase_weight

    def rerank(
        self,
        query: str,
        candidates: List[RetrievalResult],
        intent: Optional[IntentType] = None,
        top_k: int = 3,
    ) -> List[RetrievalResult]:
        """Apply cross-feature re-ranking over candidate chunks."""
        if not candidates:
            return []

        cleaned_query = query.lower()
        query_terms = set(re.findall(r"\b\w{3,}\b", cleaned_query))

        reranked: List[RetrievalResult] = []

        for candidate in candidates:
            chunk = candidate.chunk
            base_score = candidate.similarity_score

            # 1. Title match boost
            title_clean = chunk.title.lower()
            title_matches = sum(1 for t in query_terms if t in title_clean)
            title_boost = (title_matches / max(len(query_terms), 1)) * self.title_weight

            # 2. Keyphrase consecutive match boost
            phrase_boost = 0.0
            if len(cleaned_query.split()) > 1 and cleaned_query in chunk.content.lower():
                phrase_boost = self.phrase_weight

            # 3. Intent alignment boost
            intent_boost = 0.0
            if intent:
                cat_name = chunk.category.value.lower()
                if (
                    (intent == IntentType.ROADMAP_QUERY and "roadmap" in cat_name)
                    or (intent == IntentType.PLACEMENT_PREPARATION and "placement" in cat_name)
                    or (intent == IntentType.SUBJECTIVE_INTERVIEW and "subjective" in cat_name)
                    or (intent == IntentType.PLATFORM_FEATURE and "platform" in cat_name)
                ):
                    intent_boost = 0.15

            final_score = min(base_score + title_boost + phrase_boost + intent_boost, 1.0)

            reranked.append(
                RetrievalResult(
                    chunk=chunk,
                    similarity_score=round(final_score, 4),
                    dense_score=candidate.dense_score,
                    sparse_score=candidate.sparse_score,
                    rank=0,
                )
            )

        # Sort by final score descending
        reranked.sort(key=lambda x: x.similarity_score, reverse=True)

        for rank, res in enumerate(reranked[:top_k], start=1):
            res.rank = rank

        return reranked[:top_k]
