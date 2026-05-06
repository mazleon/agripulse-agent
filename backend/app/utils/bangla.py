"""Bangla language utilities."""

import re


def is_bangla_script(text: str) -> bool:
    """True if text contains Bangla Unicode characters."""
    return bool(re.search(r"[ঀ-৿]", text))


def clean_response(text: str) -> str:
    """Strip leading/trailing whitespace and normalize newlines."""
    return re.sub(r"\n{3,}", "\n\n", text.strip())
