import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const DOCS = new URL("../docs/", import.meta.url);

function precachedFiles() {
  const source = readFileSync(new URL("sw.js", DOCS), "utf8");
  const list = source.match(/const SHELL_FILES = \[([\s\S]*?)\];/)[1];
  return [...list.matchAll(/"([^"]+)"/g)].map((match) => match[1]).filter((f) => f !== "./");
}

test("every file the service worker precaches exists", () => {
  const missing = precachedFiles().filter((file) => !existsSync(new URL(file, DOCS)));
  assert.deepEqual(missing, []);
});

test("every JavaScript module is precached so the app works offline", () => {
  const cached = new Set(precachedFiles());
  const modules = ["main", "state", "store", "scheduler", "session", "summary", "dom", "math"]
    .map((name) => `js/${name}.js`);
  assert.deepEqual(modules.filter((file) => !cached.has(file)), []);
});

test("question data shipped to the app contains no verbatim quotes", () => {
  const text = readFileSync(new URL("data/questions.json", DOCS), "utf8");
  assert.equal(text.includes('"quote"'), false);
});
