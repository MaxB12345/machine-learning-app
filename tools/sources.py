"""Read course source files (PDF, notebook) into a list of page texts.

A "page" is a PDF page or, for notebooks, a single cell. Numbering starts at 1 so
that a citation like "slides p.12" matches what you see in a PDF viewer.
"""

import json
from pathlib import Path

from pypdf import PdfReader

PAGE_MARKER = "=== PAGE {number} ==="
SOURCE_SUFFIXES = {".pdf", ".ipynb"}


def read_pdf_pages(path: Path) -> list[str]:
    """Return the extracted text of each PDF page."""
    reader = PdfReader(str(path))
    return [page.extract_text() or "" for page in reader.pages]


def read_notebook_cells(path: Path) -> list[str]:
    """Return each notebook cell as text, prefixed with its cell type."""
    notebook = json.loads(path.read_text(encoding="utf-8"))
    cells = []
    for cell in notebook.get("cells", []):
        body = "".join(cell.get("source", []))
        cells.append(f"[{cell.get('cell_type', 'unknown')}]\n{body}")
    return cells


def read_pages(path: Path) -> list[str]:
    """Return page texts for a supported source file."""
    if path.suffix == ".pdf":
        return read_pdf_pages(path)
    if path.suffix == ".ipynb":
        return read_notebook_cells(path)
    raise ValueError(f"Unsupported source type: {path.suffix} ({path})")


def format_pages(pages: list[str]) -> str:
    """Join pages into one text blob with numbered page markers."""
    parts = []
    for number, text in enumerate(pages, start=1):
        parts.append(PAGE_MARKER.format(number=number))
        parts.append(text.strip())
    return "\n".join(parts) + "\n"


def parse_pages(text: str) -> dict[int, str]:
    """Inverse of format_pages: map page number to its text."""
    pages: dict[int, str] = {}
    current = None
    for line in text.splitlines():
        if line.startswith("=== PAGE ") and line.endswith(" ==="):
            current = int(line[len("=== PAGE "):-len(" ===")])
            pages[current] = ""
        elif current is not None:
            pages[current] += line + "\n"
    return pages
