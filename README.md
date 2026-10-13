# ML Mastery

An offline-capable PWA for practising a Machine Learning module with a source-cited question bank
(8 question types, spaced repetition, maths rendered with KaTeX). Static files, no build step.

## Using it
Open the GitHub Pages site on your phone, then Share > Add to Home Screen. After the first load it
works offline. Progress is stored on the device; use Stats > Export progress to back it up.

## Layout
- `docs/`: the site (served by GitHub Pages: branch `main`, folder `/docs`)
  - `data/questions.json`: generated, do not edit by hand
  - `js/`: small ES modules (`types/` holds one renderer per question type)
  - `sw.js`: service worker; `CACHE_NAME` is rewritten by `npm run bump-cache`
- `tests/`, `scripts/`: Node tests and the cache-version script

## Commands
    npm test            run unit tests
    npm run serve       serve docs/ at http://localhost:8000
    npm run bump-cache  update the service-worker cache name from a content hash

## Where the questions come from
`questions.json` is built from a private content repo (`python tools/deploy.py` there). Do not edit it here.
