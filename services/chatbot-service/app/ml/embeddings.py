import math
import re
from typing import List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

class DenseEmbedder:
    """Computes dense vector representations in L2-normalized vector space."""

    def __init__(self, api_key: str | None = None, dimension: int = 512):
        self.api_key = api_key
        self.dimension = dimension
        self.use_api = False
        if api_key and api_key.strip():
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key.strip())
                self.use_api = True
            except Exception:
                self.use_api = False

        # Robust local TF-IDF vectorizer with sub-linear TF scaling and character/word n-grams
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            max_features=dimension,
            stop_words="english",
            token_pattern=r"(?u)\b\w[\w-]*\w\b|\b\w\b",
        )
        self.is_fitted = False

    def fit(self, texts: List[str]) -> None:
        """Fit the vectorizer on the corpus documents."""
        if not texts:
            return
        cleaned = [self._preprocess(t) for t in texts]
        self.vectorizer.fit(cleaned)
        self.is_fitted = True

    def embed_text(self, text: str) -> np.ndarray:
        """Embed a single text string into a normalized dense vector."""
        return self.embed_batch([text])[0]

    def embed_batch(self, texts: List[str]) -> np.ndarray:
        """Embed a list of text strings into an array of L2-normalized vectors."""
        if not texts:
            return np.empty((0, self.dimension))

        if self.use_api:
            try:
                embeddings = []
                for t in texts:
                    res = genai.embed_content(
                        model="models/text-embedding-004",
                        content=t[:1000],
                        task_type="retrieval_document",
                    )
                    v = np.array(res["embedding"], dtype=np.float32)
                    norm = np.linalg.norm(v)
                    if norm > 0:
                        v = v / norm
                    embeddings.append(v)
                return np.vstack(embeddings)
            except Exception:
                # Fallback to local vectorizer if external API fails
                pass

        if not self.is_fitted:
            self.fit(texts)

        cleaned = [self._preprocess(t) for t in texts]
        sparse_mat = self.vectorizer.transform(cleaned)
        dense_arr = sparse_mat.toarray().astype(np.float32)

        # Ensure exact dimension shape
        if dense_arr.shape[1] < self.dimension:
            pad_width = self.dimension - dense_arr.shape[1]
            dense_arr = np.pad(dense_arr, ((0, 0), (0, pad_width)), mode="constant")
        elif dense_arr.shape[1] > self.dimension:
            dense_arr = dense_arr[:, : self.dimension]

        # L2-normalize each vector so dot product equals cosine similarity
        norms = np.linalg.norm(dense_arr, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return dense_arr / norms

    @staticmethod
    def _preprocess(text: str) -> str:
        text = text.lower()
        text = re.sub(r"[\r\n\t]+", " ", text)
        return text.strip()


default_embedder = DenseEmbedder()
