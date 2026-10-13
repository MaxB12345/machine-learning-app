# ML Mastery (machine-learning-app)

Offline PWA for practising a Machine Learning module, plus the tooling and source-cited question bank behind it.

## Layout
- `docs/`: the site served by GitHub Pages (`main`, `/docs`). `docs/data/questions.json` is generated: never edit it.
- `content/questions/week_N/*.json`: the question bank (source of truth).
- `content/extracted/`: lecture text extracted from the private course repo. Gitignored: never commit it.
- `tools/`: `extract.py`, `validate.py`, `build.py`, `deploy.py` (Python, run with `.venv/bin/python`).
- `tests/`, `scripts/`: Node tests and the service-worker cache-version script (`npm test`).

## Course material is private
The slides, worksheets, notebooks and textbooks live in the private repo `../machine-learning`
(override with `ML_COURSE_REPO`). It is read only from here: never edit, stage or commit there.

## Adding or updating a week
Run `/add-week N` (add `push` to publish). It extracts the text, writes cited questions, validates, builds,
tests and commits in this repo.

## Question rules (enforced by `tools/validate.py`)
- Every question has `sources: [{file, page, quote}]`; the quote (at least 15 characters) must appear on that
  page of the extracted source.
- Questions come only from the course material. No outside knowledge.
- Quotes are stripped from the shipped `questions.json`; only file and page are published.

## Code style
Keep every file under 150 lines, functions short and single-purpose, no dead code or magic values.
