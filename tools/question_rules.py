"""Structural rules for question-bank entries, one check per question type.

Each check returns a list of human-readable problems (empty when valid).
"""

QUESTION_TYPES = {
    "mcq", "multi", "truefalse", "flashcard", "numeric", "short", "order", "code",
}
COMMON_FIELDS = ("id", "week", "topic", "type", "prompt", "explanation", "difficulty", "sources")
DIFFICULTIES = {1, 2, 3}
MIN_CHOICES = 2
MIN_ORDER_STEPS = 3
SOURCE_FIELDS = ("file", "page", "quote")


def check_common(question: dict) -> list[str]:
    """Fields every question must have, whatever its type."""
    problems = [f"missing field '{f}'" for f in COMMON_FIELDS if f not in question]
    if question.get("type") not in QUESTION_TYPES:
        problems.append(f"unknown type {question.get('type')!r}")
    if question.get("difficulty") not in DIFFICULTIES:
        problems.append("difficulty must be 1, 2 or 3")
    sources = question.get("sources")
    if not isinstance(sources, list) or not sources:
        problems.append("sources must be a non-empty list")
    return problems


def check_source_shape(source: dict) -> list[str]:
    """A citation needs a file, a 1-based page and a verbatim quote."""
    problems = [f"source missing '{f}'" for f in SOURCE_FIELDS if f not in source]
    if "page" in source and not (isinstance(source["page"], int) and source["page"] >= 1):
        problems.append("source page must be an integer >= 1")
    return problems


def _check_choice_index(question: dict) -> list[str]:
    choices = question.get("choices", [])
    if len(choices) < MIN_CHOICES:
        return [f"needs at least {MIN_CHOICES} choices"]
    answer = question.get("answer")
    if not isinstance(answer, int) or not 0 <= answer < len(choices):
        return ["answer must be a valid choice index"]
    return []


def _check_multi(question: dict) -> list[str]:
    choices = question.get("choices", [])
    answer = question.get("answer")
    if len(choices) < MIN_CHOICES:
        return [f"needs at least {MIN_CHOICES} choices"]
    valid = isinstance(answer, list) and answer
    if not valid or any(not isinstance(i, int) or not 0 <= i < len(choices) for i in answer):
        return ["answer must be a non-empty list of valid choice indices"]
    return []


def _check_truefalse(question: dict) -> list[str]:
    return [] if isinstance(question.get("answer"), bool) else ["answer must be true or false"]


def _check_text_answer(question: dict) -> list[str]:
    answer = question.get("answer")
    return [] if isinstance(answer, str) and answer.strip() else ["answer must be non-empty text"]


def _check_numeric(question: dict) -> list[str]:
    problems = []
    if not isinstance(question.get("answer"), (int, float)) or isinstance(question["answer"], bool):
        problems.append("answer must be a number")
    tolerance = question.get("tolerance")
    if not isinstance(tolerance, (int, float)) or tolerance < 0:
        problems.append("numeric questions need tolerance >= 0")
    return problems


def _check_order(question: dict) -> list[str]:
    steps = question.get("steps", [])
    if len(steps) < MIN_ORDER_STEPS:
        return [f"order needs at least {MIN_ORDER_STEPS} steps"]
    return []


def _check_code(question: dict) -> list[str]:
    problems = _check_choice_index(question)
    if not str(question.get("code", "")).strip():
        problems.append("code question needs a 'code' snippet")
    return problems


TYPE_CHECKS = {
    "mcq": _check_choice_index,
    "multi": _check_multi,
    "truefalse": _check_truefalse,
    "flashcard": _check_text_answer,
    "short": _check_text_answer,
    "numeric": _check_numeric,
    "order": _check_order,
    "code": _check_code,
}


def check_question(question: dict) -> list[str]:
    """Return all structural problems for one question."""
    problems = check_common(question)
    for source in question.get("sources", []) if isinstance(question.get("sources"), list) else []:
        problems += check_source_shape(source)
    check = TYPE_CHECKS.get(question.get("type"))
    return problems + (check(question) if check else [])
