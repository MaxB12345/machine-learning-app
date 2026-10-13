import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { computeVersion, withCacheName } from "../scripts/cache-version.mjs";

const SW = 'const CACHE_NAME = "ml-mastery-v1";\nconst SHELL_FILES = [];\n';

function makeDocs(files) {
  const dir = mkdtempSync(join(tmpdir(), "docs-"));
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(join(dir, name, ".."), { recursive: true });
    writeFileSync(join(dir, name), content);
  }
  return dir;
}

test("version is stable for identical content", () => {
  const a = makeDocs({ "index.html": "x", "sw.js": SW });
  const b = makeDocs({ "index.html": "x", "sw.js": SW });
  assert.equal(computeVersion(a), computeVersion(b));
  [a, b].forEach((dir) => rmSync(dir, { recursive: true }));
});

test("version changes when a shipped file changes", () => {
  const a = makeDocs({ "index.html": "x", "data/q.json": "[1]", "sw.js": SW });
  const b = makeDocs({ "index.html": "x", "data/q.json": "[2]", "sw.js": SW });
  assert.notEqual(computeVersion(a), computeVersion(b));
  [a, b].forEach((dir) => rmSync(dir, { recursive: true }));
});

test("version ignores the CACHE_NAME line itself but not the rest of sw.js", () => {
  const renamed = SW.replace("ml-mastery-v1", "ml-mastery-abcd1234");
  const edited = SW.replace("[]", '["a.js"]');
  const a = makeDocs({ "sw.js": SW });
  const b = makeDocs({ "sw.js": renamed });
  const c = makeDocs({ "sw.js": edited });
  assert.equal(computeVersion(a), computeVersion(b));
  assert.notEqual(computeVersion(a), computeVersion(c));
  [a, b, c].forEach((dir) => rmSync(dir, { recursive: true }));
});

test("withCacheName rewrites only the CACHE_NAME line", () => {
  const result = withCacheName(SW, "deadbeef");
  assert.equal(result, 'const CACHE_NAME = "ml-mastery-deadbeef";\nconst SHELL_FILES = [];\n');
});

test("withCacheName throws a clear error when the line is missing", () => {
  assert.throws(() => withCacheName("// nothing", "x"), /no line like/);
});
