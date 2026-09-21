from typing import List, Tuple, Optional
import numpy as np
from app.models.document import DocumentChunk, KnowledgeCategory


class VectorStore:
    """In-memory Vector Index calculating Cosine Similarity over L2-normalized embeddings."""

    def __init__(self):
        self.chunks: List[DocumentChunk] = []
        self.vectors: Optional[np.ndarray] = None

    def add_chunks(self, chunks: List[DocumentChunk], vectors: np.ndarray) -> None:
        """Add document chunks and their corresponding embedding vectors to the index."""
        if len(chunks) != len(vectors):
            raise ValueError("Number of chunks must match number of vectors")

        if self.vectors is None or len(self.chunks) == 0:
            self.chunks = list(chunks)
            self.vectors = np.array(vectors, dtype=np.float32)
        else:
            self.chunks.extend(chunks)
            self.vectors = np.vstack([self.vectors, vectors])

    def similarity_search(
        self,
        query_vector: np.ndarray,
        top_k: int = 5,
        category: Optional[KnowledgeCategory] = None,
        threshold: float = 0.05,
    ) -> List[Tuple[DocumentChunk, float]]:
        """Perform cosine similarity search against indexed vector space."""
        if self.vectors is None or len(self.chunks) == 0:
            return []

        # Ensure query vector is unit normalized
        q_norm = np.linalg.norm(query_vector)
        if q_norm > 0:
            query_vector = query_vector / q_norm

        # Cosine similarity is dot product of normalized vectors
        scores = np.dot(self.vectors, query_vector)

        results: List[Tuple[DocumentChunk, float]] = []
        # Sort indices descending by similarity score
        ranked_indices = np.argsort(scores)[::-1]

        for idx in ranked_indices:
            score = float(scores[idx])
            if score < threshold:
                continue

            chunk = self.chunks[idx]
            if category and chunk.category != category:
                continue

            results.append((chunk, score))
            if len(results) >= top_k:
                break

        return results

    def count(self) -> int:
        return len(self.chunks)

    def clear(self) -> None:
        self.chunks.clear()
        self.vectors = None


default_vector_store = VectorStore()
