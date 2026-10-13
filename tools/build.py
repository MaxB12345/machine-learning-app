"""Build docs/data/questions.json from the validated question bank.

Usage: python tools/build.py
Verbatim quotes are stripped: the app only ships file and page references.
"""

import json
import sys
from pathlib import Path

from question_bank import REPO_ROOT, load_questions
from validate import collect_problems

OUTPUT_PATH = REPO_ROOT / "docs" / "data" / "questions.json"
SHIPPED_SOURCE_FIELDS = ("file", "page")


def public_question(question: dict) -> dict:
    """Return the question as shipped to the app, without source quotes."""
    shipped = dict(question)
    shipped["sources"] = [
        {field: source[field] for field in SHIPPED_SOURCE_FIELDS}
        for source in question["sources"]
    ]
    return shipped


def build(output_path: Path = OUTPUT_PATH) -> int:
    """Write the app data file, return the number of questions written."""
    questions = [public_question(question) for _, question in load_questions()]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(questions, indent=1) + "\n", encoding="utf-8")
    return len(questions)


def main() -> int:
    problems = collect_problems()
    if problems:
        print("\n".join(problems), file=sys.stderr)
        print("Build aborted: fix validation problems first.", file=sys.stderr)
        return 1
    print(f"Wrote {build()} questions to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
