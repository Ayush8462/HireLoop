import logging
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
                response = self.gemini.generate_content(prompt)
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
        """Synthesizes structured, informative answers directly from top-ranked chunks."""
        if not retrieved_results:
            return (
                "I couldn't find exact matches for your query in the current knowledge base. "
                "However, you can explore **Tech Roadmaps**, **Core CS Preparation**, **Subjective Interviews (STAR)**, "
                "or **HireLoop Platform features** (Mock Interviews, Referrals, ATS Scanner)."
            )

        top_chunk = retrieved_results[0].chunk
        lines: List[str] = []

        lines.append(f"Here is what you need to know about **{top_chunk.title}**:\n")
        lines.append(top_chunk.content)

        # If multiple relevant chunks, provide supplementary context
        if len(retrieved_results) > 1:
            second_chunk = retrieved_results[1].chunk
            if retrieved_results[1].similarity_score > 0.25:
                lines.append(f"\n\n#### Related Guidance: {second_chunk.title}\n")
                lines.append(second_chunk.content)

        lines.append("\n\n---\n")
        lines.append(
            "> **Pro-Tip**: On HireLoop, you can book a 1-on-1 mock interview with verified seniors from top tech companies to practice and evaluate these concepts live!"
        )

        return "".join(lines)


default_generator = ResponseGenerator()
