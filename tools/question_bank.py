"""Load the question bank and verify citations against the extracted sources."""

import json
import re
import unicodedata
from pathlib import Path

from sources import parse_pages

REPO_ROOT = Path(__file__).resolve().parent.parent
QUESTIONS_DIR = REPO_ROOT / "content" / "questions"
EXTRACT_DIR = REPO_ROOT / "content" / "extracted"
_WHITESPACE = re.compile(r"\s+")
MIN_QUOTE_CHARS = 15


def normalize(text: str) -> str:
    """Make text comparable: expand ligatures (NFKC) and drop all whitespace.

    PDF extraction splits maths across lines and inserts odd spacing, so
    whitespace is ignored entirely when matching quotes.
    """
    return _WHITESPACE.sub("", unicodedata.normalize("NFKC", text))


def load_questions() -> list[tuple[Path, dict]]:
    """Return (file, question) pairs for every question file, sorted by path."""
    loaded = []
    for path in sorted(QUESTIONS_DIR.rglob("*.json")):
        entries = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(entries, list):
            raise ValueError(f"{path}: expected a JSON array of questions")
        loaded += [(path, entry) for entry in entries]
    return loaded


def load_source_pages(source_file: str) -> dict[int, str] | None:
    """Return the extracted pages of a source file, or None if not extracted."""
    extracted = EXTRACT_DIR / (source_file + ".txt")
    if not extracted.exists():
        return None
    return parse_pages(extracted.read_text(encoding="utf-8"))


def check_citation(source: dict) -> list[str]:
    """Confirm the quote really appears on the cited page of the cited file."""
    pages = load_source_pages(source["file"])
    if pages is None:
        return [f"source file not extracted: {source['file']}"]
    page_text = pages.get(source["page"])
    if page_text is None:
        return [f"{source['file']} has no page {source['page']}"]
    quote = normalize(source["quote"])
    if len(quote) < MIN_QUOTE_CHARS:
        return [f"quote too short to be evidence (<{MIN_QUOTE_CHARS} chars): {source['quote']!r}"]
    if quote not in normalize(page_text):
        return [f"quote not found on {source['file']} p.{source['page']}: {source['quote'][:60]!r}"]
    return []
