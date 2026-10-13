"""Validate the question bank, build it, test the app and (optionally) publish.

Usage:
    python tools/deploy.py          validate, build, test, bump cache; leave changes uncommitted
    python tools/deploy.py --push   ...then commit and push this repo (publishes the site)

Every step must succeed before the next runs, so a bad question never ships.
"""

import subprocess
import sys

from build import OUTPUT_PATH, build
from question_bank import REPO_ROOT
from validate import collect_problems

COMMIT_MESSAGE = "Update question bank"


def run(command: list[str]) -> str:
    """Run a command inside this repo; raise with its output if it fails."""
    result = subprocess.run(command, cwd=REPO_ROOT, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"{' '.join(command)} failed:\n{result.stdout}{result.stderr}")
    return result.stdout.strip()


def validate_and_build() -> None:
    problems = collect_problems()
    if problems:
        raise RuntimeError("Validation failed:\n" + "\n".join(problems))
    print(f"Built {build()} questions -> {OUTPUT_PATH}")


def test_and_bump() -> None:
    run(["npm", "test"])
    print("App tests passed")
    print(run(["npm", "run", "--silent", "bump-cache"]))


def publish() -> None:
    run(["git", "add", "-A"])
    if not run(["git", "status", "--porcelain"]):
        print("Nothing to publish: app repo is already up to date.")
        return
    run(["git", "commit", "-m", COMMIT_MESSAGE])
    run(["git", "push"])
    print("Pushed. GitHub Pages will update within a minute or two.")


def main() -> int:
    try:
        validate_and_build()
        test_and_bump()
        if "--push" in sys.argv:
            publish()
        else:
            print(f"\nReview and publish with:\n  git add -A && git commit -m '{COMMIT_MESSAGE}' && git push")
    except RuntimeError as error:
        print(error, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
