"""Safety layer — applied to every LLM response before sending to the farmer."""
import logging
import re

from langdetect import detect, LangDetectException

logger = logging.getLogger(__name__)

# Patterns that suggest dangerously high pesticide dosage
_OVERDOSE_PATTERNS = [
    r"\b(\d+)\s*(?:times|গুণ)\s*(?:more|বেশি|extra)\b",
    r"\b(?:double|triple|quadruple)\s*(?:the\s+)?(?:dose|matra|মাত্রা)\b",
    r"\b(\d{3,})\s*(?:ml|cc|liter|litre)\s*(?:per\s+)?(?:acre|bigha|decimal|বিঘা|একর)\b",
]

_OVERDOSE_RE = re.compile("|".join(_OVERDOSE_PATTERNS), re.IGNORECASE)

FALLBACK_SUFFIX = (
    "\n\n⚠️ **সতর্কতা:** কীটনাশক বা ওষুধ প্রয়োগের আগে প্যাকেটের লেবেল পড়ুন। "
    "প্রয়োজনে নিকটস্থ কৃষি অফিসে যোগাযোগ করুন।"
)

LOW_CONFIDENCE_SUFFIX = (
    "\n\n📸 ছবিটি আরও স্পষ্ট করে তুলুন অথবা নিকটস্থ কৃষি অফিসে যোগাযোগ করুন।"
)


def _has_overdose_language(text: str) -> bool:
    return bool(_OVERDOSE_RE.search(text))


def _is_bangla(text: str) -> bool:
    try:
        return detect(text) in ("bn", "hi")  # hi catches some Devanagari-mixed Bangla
    except LangDetectException:
        return True  # assume ok if detection fails


async def apply_safety(response: str, vision_confidence: float | None = None) -> str:
    """
    Safety gates applied in order:
    1. Overdose language → reprompt with LLM to soften
    2. Low vision confidence → append photo quality suggestion
    3. Non-Bangla output → reprompt to translate
    """
    if not response:
        return "দুঃখিত, এই মুহূর্তে উত্তর দেওয়া সম্ভব হচ্ছে না। পরে আবার চেষ্টা করুন।"

    # Gate 1: pesticide overdose language
    if _has_overdose_language(response):
        logger.warning("Overdose language detected — reprompting safety LLM")
        response = await _reprompt_safety(response)

    # Gate 2: low-confidence vision
    if vision_confidence is not None and vision_confidence < 0.60:
        response += LOW_CONFIDENCE_SUFFIX

    # Gate 3: Bangla guarantee
    if not _is_bangla(response):
        logger.warning("Non-Bangla response detected — reprompting for translation")
        response = await _reprompt_bangla(response)

    return response


async def _reprompt_safety(original: str) -> str:
    from app.agents.prompts import SAFETY_REPROMPT
    from app.config import get_llm
    from langchain_core.messages import HumanMessage

    llm = get_llm(fast=True)
    prompt = SAFETY_REPROMPT.format(response=original)
    try:
        result = await llm.ainvoke([HumanMessage(content=prompt)])
        return result.content.strip()
    except Exception as exc:
        logger.error("Safety reprompt failed: %s", exc)
        return original + FALLBACK_SUFFIX


async def _reprompt_bangla(original: str) -> str:
    from app.config import get_llm
    from langchain_core.messages import HumanMessage

    llm = get_llm(fast=True)
    prompt = (
        f"Translate the following agricultural advice into Bangla (Bengali script). "
        f"Keep all specific technical terms and numbers:\n\n{original}"
    )
    try:
        result = await llm.ainvoke([HumanMessage(content=prompt)])
        return result.content.strip()
    except Exception as exc:
        logger.error("Bangla reprompt failed: %s", exc)
        return original
