"""Extract every course PDF and notebook into numbered-page text files.

Usage: python tools/extract.py
Reads the course repo (sibling `machine-learning`, or ML_COURSE_REPO).
Output: content/extracted/<path of source>.txt, one file per source. The output
is gitignored: lecture text stays on this machine and is never published.
"""

import os
import sys
from pathlib import Path

from sources import SOURCE_SUFFIXES, format_pages, read_pages

REPO_ROOT = Path(__file__).resolve().parent.parent
COURSE_REPO = Path(os.environ.get("ML_COURSE_REPO", REPO_ROOT.parent / "machine-learning"))
EXTRACT_DIR = REPO_ROOT / "content" / "extracted"
WEEK_GLOB = "week_*"
CHECKPOINT_DIR = ".ipynb_checkpoints"


def find_sources() -> list[Path]:
    """Return all PDFs and notebooks inside the week folders."""
    found = []
    for week_dir in sorted(COURSE_REPO.glob(WEEK_GLOB)):
        for path in sorted(week_dir.rglob("*")):
            is_source = path.suffix in SOURCE_SUFFIXES
            if is_source and CHECKPOINT_DIR not in path.parts:
                found.append(path)
    return found


def output_path(source: Path) -> Path:
    """Return where the extracted text of `source` is written."""
    relative = source.relative_to(COURSE_REPO)
    return EXTRACT_DIR / relative.parent / (relative.name + ".txt")


def extract_one(source: Path) -> int:
    """Extract a single source file, return its page count."""
    pages = read_pages(source)
    target = output_path(source)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(format_pages(pages), encoding="utf-8")
    return len(pages)


def main() -> int:
    sources = find_sources()
    empty_sources = []
    for source in sources:
        count = extract_one(source)
        label = source.relative_to(COURSE_REPO)
        print(f"{count:4d} pages  {label}")
        if count == 0:
            empty_sources.append(label)
    if empty_sources:
        print(f"No text extracted from: {empty_sources}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
