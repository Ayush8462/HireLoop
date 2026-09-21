import re
from typing import Dict, List, Tuple
from app.models.agent_state import IntentType


class IntentRouter:
    """Classifies user queries into discrete intent categories to steer retrieval and synthesis."""

    GREETING_PATTERNS = [
        r"^(hi|hello|hey|greetings|hola|namaste|good\s*(morning|afternoon|evening|day))(\b|[\s\.\!\,])",
        r"^(who\s+are\s+you|what\s+is\s+your\s+name|what\s+can\s+you\s+do|help\s*me|how\s+can\s+you\s+help)",
        r"^(thanks|thank\s+you|thx|bye|goodbye|see\s+you)",
    ]

    INTENT_KEYWORD_RULES: Dict[IntentType, List[str]] = {
        IntentType.ROADMAP_QUERY: [
            "roadmap", "google", "microsoft", "amazon", "flipkart", "zomato",
            "codility", "machine coding", "sde 1", "swe", "oa", "online assessment",
            "interview process", "rounds in", "hiring process", "bar raiser",
            "preparation roadmap", "sde roadmap", "algo rounds",
        ],
        IntentType.PLACEMENT_PREPARATION: [
            "placement", "campus placement", "off campus", "campus drive",
            "operating system", "os", "process vs thread", "deadlock", "paging",
            "virtual memory", "concurrency", "mutex", "semaphore",
            "dbms", "sql", "acid", "normalization", "b+ tree", "indexing",
            "computer networks", "cn", "tcp", "udp", "3-way handshake", "dns",
            "osi model", "http vs https", "oop", "solid", "design patterns",
            "core cs", "aptitude", "mcqs",
        ],
        IntentType.SUBJECTIVE_INTERVIEW: [
            "star method", "tell me about yourself", "elevator pitch", "behavioral",
            "hr round", "hr interview", "weakness", "conflict", "failure",
            "leadership principles", "amazon lp", "customer obsession",
            "questions to ask", "situational questions", "bias for action",
            "dive deep", "culture fit",
        ],
        IntentType.PLATFORM_FEATURE: [
            "hireloop", "platform", "ats", "resume scanner", "score",
            "mock interview", "book mentor", "book session", "senior",
            "referral", "request referral", "my profile", "upload resume",
            "view resume", "how does hireloop work", "features",
        ],
    }

    def route(self, query: str) -> Tuple[IntentType, float]:
        """Returns the detected IntentType and a confidence score between 0.0 and 1.0."""
        text = query.strip().lower()

        # Check greetings / meta chat
        for pattern in self.GREETING_PATTERNS:
            if re.search(pattern, text):
                return IntentType.CHITCHAT_OR_GREETING, 0.95

        # Check keyword matches
        scores: Dict[IntentType, int] = {}
        for intent, keywords in self.INTENT_KEYWORD_RULES.items():
            count = 0
            for kw in keywords:
                if kw in text:
                    count += 1
            scores[intent] = count

        best_intent = max(scores, key=lambda k: scores[k])
        best_count = scores[best_intent]

        if best_count > 0:
            confidence = min(0.5 + (best_count * 0.15), 0.95)
            return best_intent, confidence

        return IntentType.GENERAL_QUERY, 0.4


default_router = IntentRouter()
