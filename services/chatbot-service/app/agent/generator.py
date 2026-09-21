import logging
import re
from typing import List, Optional, Tuple

from app.config import settings
from app.agent.prompt_templates import (
    SYSTEM_PROMPT,
    RAG_USER_PROMPT_TEMPLATE,
    GREETING_RESPONSE,
)
from app.models.agent_state import IntentType
from app.models.chat import ChatMessage, SourceCitation
from app.models.document import RetrievalResult

logger = logging.getLogger(__name__)

# Initialize Gemini if key exists
_gemini_client = None
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY.strip())
        _gemini_client = genai.GenerativeModel(
            model_name=settings.MODEL_NAME,
            system_instruction=SYSTEM_PROMPT,
        )
        logger.info(f"Initialized Google Gemini model: {settings.MODEL_NAME}")
    except Exception as e:
        logger.warning(f"Could not initialize Gemini: {e}. Falling back to ML Semantic Synthesizer.")
else:
    logger.info("No GEMINI_API_KEY configured. Running in Local ML Semantic Synthesizer mode.")


FOLLOW_UP_SUGGESTIONS = {
    IntentType.ROADMAP_QUERY: [
        "What are the most frequent DSA patterns asked in OAs?",
        "How do I prepare for the Machine Coding round?",
        "Can you guide me on the STAR method for behavioral rounds?",
        "How do I book a mock interview with a senior?",
    ],
    IntentType.PLACEMENT_PREPARATION: [
        "Explain Process vs Thread and Context Switching",
        "What are ACID properties and Database Indexing?",
        "How do I get off-campus referrals on LinkedIn?",
        "What is the HireLoop ATS resume scanner?",
    ],
    IntentType.SUBJECTIVE_INTERVIEW: [
        "Give me an example of the STAR method for a challenging bug",
        "How do I answer 'Tell me about yourself'?",
        "What are Amazon's 14 Leadership Principles?",
        "What questions should I ask the interviewer at the end?",
    ],
    IntentType.PLATFORM_FEATURE: [
        "How do I book a 1-on-1 mock interview with an industry senior?",
        "How does the ATS Resume Scanner calculate my score?",
        "Where can I upload and view my resume?",
        "How do I request a referral from a senior?",
    ],
    IntentType.CHITCHAT_OR_GREETING: [
        "Google SDE interview roadmap",
        "Explain DBMS ACID properties",
        "How do I use the STAR method?",
        "How does HireLoop mock interview booking work?",
    ],
    IntentType.GENERAL_QUERY: [
        "Show me the Google SDE roadmap",
        "Top Core CS subjects for campus placements",
        "How does the HireLoop ATS resume scanner work?",
        "Behavioral interview preparation tips",
    ],
}


class ResponseGenerator:
    """Generates grounded responses using Gemini or a high-precision ML semantic synthesizer."""

    def __init__(self):
        self.gemini = _gemini_client

    def generate(
        self,
        query: str,
        retrieved_results: List[RetrievalResult],
        intent: IntentType,
        history: Optional[List[ChatMessage]] = None,
    ) -> Tuple[str, List[SourceCitation], List[str]]:
        """Synthesizes an answer and extracts citations and suggested follow-ups."""
        
        # Handle simple greetings
        if intent == IntentType.CHITCHAT_OR_GREETING:
            return GREETING_RESPONSE, [], FOLLOW_UP_SUGGESTIONS[IntentType.CHITCHAT_OR_GREETING]

        # Build citations
        citations: List[SourceCitation] = []
        context_blocks: List[str] = []

        for res in retrieved_results:
            chunk = res.chunk
            snippet = chunk.content[:200].replace("\n", " ") + "..."
            citations.append(
                SourceCitation(
                    id=chunk.id,
                    title=chunk.title,
                    category=chunk.category.value,
                    similarity=round(res.similarity_score, 3),
                    snippet=snippet,
                )
            )
            context_blocks.append(f"### {chunk.title}\nCategory: {chunk.category.value}\n{chunk.content}")

        context_text = "\n\n".join(context_blocks) if context_blocks else "No specific documents found."

        # Format history
        history_text = ""
        if history:
            history_snippets = []
            for m in history[-4:]:
                role_label = "User" if m.role == "user" else "Assistant"
                history_snippets.append(f"{role_label}: {m.content}")
            history_text = "\n".join(history_snippets)
        else:
            history_text = "None."

        # Attempt Gemini LLM Generation if available
        if self.gemini is not None:
            try:
                prompt = RAG_USER_PROMPT_TEMPLATE.format(
                    context=context_text,
                    history=history_text,
                    query=query,
                )
                response = self.gemini.generate_content(prompt, request_options={"timeout": 6.0})
                if response and response.text:
                    followups = FOLLOW_UP_SUGGESTIONS.get(intent, FOLLOW_UP_SUGGESTIONS[IntentType.GENERAL_QUERY])
                    return response.text.strip(), citations, followups
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}. Falling back to ML Semantic Synthesizer.")

        # Resilient Local Semantic Synthesizer
        answer = self._semantic_synthesis(query, retrieved_results, intent)
        followups = FOLLOW_UP_SUGGESTIONS.get(intent, FOLLOW_UP_SUGGESTIONS[IntentType.GENERAL_QUERY])
        return answer, citations, followups

    def _semantic_synthesis(
        self,
        query: str,
        retrieved_results: List[RetrievalResult],
        intent: IntentType,
    ) -> str:
        """Synthesizes concise, high-precision answers directly from the top matching chunk."""
        if not retrieved_results:
            return (
                "I couldn't find exact matches for your query. "
                "You can ask about **Company Roadmaps** (Google, Amazon), **Core CS** (OS, DBMS, CN), "
                "or **HireLoop features** (Mock Interviews, Referrals, ATS Scanner)."
            )

        top_chunk = retrieved_results[0].chunk
        raw_content = top_chunk.content.strip()

        # Split content into individual points / sections
        raw_items = [it.strip() for it in re.split(r"\n(?=\d+\.\s+)", raw_content) if it.strip()]

        intro_line = ""
        structured_items = []
        if raw_items:
            first = raw_items[0]
            if re.match(r"^\d+\.\s+", first):
                structured_items = raw_items
            else:
                lines = first.split("\n", 1)
                intro_line = lines[0].strip()
                if len(lines) > 1 and lines[1].strip():
                    structured_items = [it.strip() for it in re.split(r"\n(?=\d+\.\s+)", lines[1]) if it.strip()]
                structured_items.extend(raw_items[1:])
        else:
            structured_items = [raw_content]

        # Check if user query specifies sub-topics beyond the main title
        title_tokens = set(re.findall(r"\b\w{3,}\b", top_chunk.title.lower()))
        q_tokens = set(re.findall(r"\b\w{3,}\b", query.lower()))
        stop_words = {
            "how", "what", "why", "when", "where", "who", "which", "can", "could",
            "tell", "explain", "give", "show", "help", "about", "with", "from",
            "does", "done", "used", "using", "work", "works", "working", "need",
            "know", "want", "like", "use", "for", "the", "and", "that", "this",
            "interview", "interviews", "preparation", "prepare", "steps",
        }
        specific_q_tokens = (q_tokens - title_tokens) - stop_words

        specific_matches = []
        if specific_q_tokens:
            for item in structured_items:
                item_lower = item.lower()
                overlap = sum(1 for t in specific_q_tokens if t in item_lower)
                if overlap > 0:
                    specific_matches.append((item, overlap))
            specific_matches.sort(key=lambda x: x[1], reverse=True)

        # If user targeted a specific sub-concept (e.g. "deadlock" inside OS, or "ACID" inside DBMS)
        if specific_matches and specific_matches[0][1] >= 1 and len(specific_matches) < len(structured_items):
            top_spec = specific_matches[0][1]
            selected_items = [it for it, sc in specific_matches if sc >= top_spec][:2]
        else:
            # Topic-level framework or roadmap: keep the first 4 items in sequence
            selected_items = structured_items[:4]

        # Format output cleanly
        output_lines = [f"### {top_chunk.title}\n"]

        for item in selected_items:
            cleaned_item = item.strip()
            # Trim excessively long points to the most essential 2 sentences (ignoring numbering dots)
            sentences = [x.strip() for x in re.split(r"(?<!\d)[.!?]\s+", cleaned_item) if x.strip()]
            if len(sentences) > 2 and len(cleaned_item) > 220:
                cleaned_item = ". ".join(sentences[:2]) + "."

            # Ensure proper bullet formatting
            if not cleaned_item.startswith(("-", "*", "1", "2", "3", "4", "5")):
                cleaned_item = f"• {cleaned_item}"
            output_lines.append(cleaned_item)

        output_lines.append(
            "\n> **Pro-Tip**: Practice these exact questions 1-on-1 with verified seniors on HireLoop!"
        )

        return "\n\n".join(output_lines)


default_generator = ResponseGenerator()
