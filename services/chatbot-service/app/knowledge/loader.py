import json
import logging
from pathlib import Path
from typing import List, Optional

from app.models.document import DocumentChunk, KnowledgeCategory

logger = logging.getLogger(__name__)

CATEGORY_MAP = {
    "company_roadmap": KnowledgeCategory.COMPANY_ROADMAP,
    "jobs_and_placements": KnowledgeCategory.JOBS_AND_PLACEMENTS,
    "placement_prep": KnowledgeCategory.JOBS_AND_PLACEMENTS,
    "subjective_interview": KnowledgeCategory.SUBJECTIVE_INTERVIEW,
    "platform_guide": KnowledgeCategory.PLATFORM_GUIDE,
    "general_faq": KnowledgeCategory.GENERAL_FAQ,
}


class KnowledgeLoader:
    def __init__(self, data_dir: Optional[Path] = None):
        if data_dir is None:
            self.data_dir = Path(__file__).resolve().parent / "data"
        else:
            self.data_dir = Path(data_dir)

    def load_all(self) -> List[DocumentChunk]:
        """Loads and parses all JSON knowledge files into DocumentChunk objects."""
        chunks: List[DocumentChunk] = []
        if not self.data_dir.exists():
            logger.warning(f"Knowledge data directory does not exist: {self.data_dir}")
            return chunks

        json_files = sorted(self.data_dir.glob("*.json"))
        logger.info(f"Loading knowledge documents from {len(json_files)} files in {self.data_dir}")

        for filepath in json_files:
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    items = json.load(f)

                file_chunks = 0
                for item in items:
                    raw_cat = item.get("category", "general_faq").lower()
                    category = CATEGORY_MAP.get(raw_cat, KnowledgeCategory.GENERAL_FAQ)

                    chunk = DocumentChunk(
                        id=item["id"],
                        title=item.get("title", item["id"]),
                        category=category,
                        content=item["content"],
                        tags=item.get("tags", []),
                        metadata=item.get("metadata", {"source_file": filepath.name}),
                    )
                    chunks.append(chunk)
                    file_chunks += 1

                logger.info(f"Loaded {file_chunks} chunks from {filepath.name}")
            except Exception as e:
                logger.error(f"Failed to load knowledge file {filepath}: {e}", exc_info=True)

        logger.info(f"Total knowledge chunks loaded: {len(chunks)}")
        return chunks


default_loader = KnowledgeLoader()
