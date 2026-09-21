import math
import re
from collections import Counter
from typing import List, Dict, Optional, Tuple
import numpy as np

from app.models.document import DocumentChunk, KnowledgeCategory, RetrievalResult
from app.ml.embeddings import DenseEmbedder
from app.ml.vector_store import VectorStore


class SparseBM25Index:
    """Okapi BM25 implementation for lexical sparse retrieval."""

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus_size = 0
        self.avg_doc_len = 0.0
        self.doc_lengths: List[int] = []
        self.doc_freqs: Dict[str, int] = {}
        self.term_freqs: List[Counter] = []

    def fit(self, documents: List[str]) -> None:
        self.corpus_size = len(documents)
        if self.corpus_size == 0:
            return

        total_tokens = 0
        self.doc_lengths = []
        self.term_freqs = []
        self.doc_freqs = {}

        for doc in documents:
            tokens = self._tokenize(doc)
            length = len(tokens)
            self.doc_lengths.append(length)
            total_tokens += length

            tf = Counter(tokens)
            self.term_freqs.append(tf)

            for term in tf.keys():
                self.doc_freqs[term] = self.doc_freqs.get(term, 0) + 1

        self.avg_doc_len = total_tokens / self.corpus_size if self.corpus_size > 0 else 1.0

    def score_query(self, query: str) -> List[float]:
        if self.corpus_size == 0:
            return []

        q_tokens = self._tokenize(query)
        scores = [0.0] * self.corpus_size

        for term in q_tokens:
            df = self.doc_freqs.get(term, 0)
            if df == 0:
                continue

            # Inverse Document Frequency with smoothing
            idf = math.log(1.0 + (self.corpus_size - df + 0.5) / (df + 0.5))

            for idx in range(self.corpus_size):
                tf = self.term_freqs[idx].get(term, 0)
                doc_len = self.doc_lengths[idx]

                numerator = tf * (self.k1 + 1.0)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / self.avg_doc_len))
                scores[idx] += idf * (numerator / denominator)

        # Min-max normalize scores to [0, 1] range
        max_score = max(scores) if scores else 0.0
        if max_score > 0:
            scores = [s / max_score for s in scores]

        return scores

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        cleaned = text.lower()
        return [tok for tok in re.findall(r"\b\w[\w-]*\w\b|\b\w\b", cleaned) if len(tok) > 1]


class HybridRetriever:
    """Combines Dense Cosine Vector Space with Sparse BM25 via Convex Hybrid Fusion."""

    def __init__(
        self,
        embedder: DenseEmbedder,
        vector_store: VectorStore,
        alpha: float = 0.65,  # 0.65 dense weight, 0.35 lexical weight
    ):
        self.embedder = embedder
        self.vector_store = vector_store
        self.alpha = alpha
        self.bm25 = SparseBM25Index()

    def build_index(self, chunks: List[DocumentChunk]) -> None:
        """Indexes all chunks for both dense and sparse retrieval."""
        texts = [f"{c.title}\n{c.content}\n{' '.join(c.tags)}" for c in chunks]

        # 1. Sparse BM25 fit
        self.bm25.fit(texts)

        # 2. Dense Vector fit & indexing
        vectors = self.embedder.embed_batch(texts)
        self.vector_store.clear()
        self.vector_store.add_chunks(chunks, vectors)

    def retrieve(
        self,
        query: str,
        top_k: int = 4,
        category: Optional[KnowledgeCategory] = None,
        min_threshold: float = 0.12,
    ) -> List[RetrievalResult]:
        """Execute hybrid search combining Dense Semantic and Sparse BM25 scores."""
        if self.vector_store.count() == 0:
            return []

        # Dense retrieval
        q_vector = self.embedder.embed_text(query)
        dense_scores = np.dot(self.vector_store.vectors, q_vector)

        # Normalize dense scores to [0, 1]
        dense_max = np.max(dense_scores) if len(dense_scores) > 0 else 1.0
        if dense_max > 0:
            dense_scores = np.clip(dense_scores / dense_max, 0.0, 1.0)

        # Sparse BM25 retrieval
        sparse_scores = self.bm25.score_query(query)

        # Convex combination: score = alpha * dense + (1 - alpha) * sparse
        combined_scores: List[Tuple[int, float, float, float]] = []
        for i, chunk in enumerate(self.vector_store.chunks):
            if category and chunk.category != category:
                continue

            d_s = float(dense_scores[i])
            s_s = float(sparse_scores[i])
            hybrid_score = (self.alpha * d_s) + ((1.0 - self.alpha) * s_s)

            if hybrid_score >= min_threshold:
                combined_scores.append((i, hybrid_score, d_s, s_s))

        # Rank by hybrid score descending
        combined_scores.sort(key=lambda x: x[1], reverse=True)

        results: List[RetrievalResult] = []
        for rank, (idx, hybrid_s, dense_s, sparse_s) in enumerate(combined_scores[:top_k], start=1):
            results.append(
                RetrievalResult(
                    chunk=self.vector_store.chunks[idx],
                    similarity_score=round(hybrid_s, 4),
                    dense_score=round(dense_s, 4),
                    sparse_score=round(sparse_s, 4),
                    rank=rank,
                )
            )

        return results
