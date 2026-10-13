"""Validate the question bank: structure, unique ids and verbatim citations.

Usage: python tools/validate.py
Exit code is non-zero if any question has a problem, so it can gate the build.
"""

import sys
from collections import Counter

from question_bank import check_citation, load_questions
from question_rules import check_question


def collect_problems() -> list[str]:
    """Return every problem found, each prefixed with file and question id."""
    loaded = load_questions()
    ids = Counter(question.get("id") for _, question in loaded)
    problems = []
    for path, question in loaded:
        label = f"{path.name}:{question.get('id', '?')}"
        found = check_question(question)
        if ids[question.get("id")] > 1:
            found.append("duplicate id")
        if not found:
            for source in question["sources"]:
                found += check_citation(source)
        problems += [f"{label}: {problem}" for problem in found]
    return problems


def main() -> int:
    total = len(load_questions())
    problems = collect_problems()
    for problem in problems:
        print(problem, file=sys.stderr)
    print(f"{total} questions, {len(problems)} problems")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
