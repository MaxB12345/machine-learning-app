import assert from "node:assert/strict";
import { test } from "node:test";
import { exportProgress, loadProgress, parseExport, recordAnswer, saveProgress } from "../docs/js/store.js";

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => { data[key] = value; },
  };
}

test("loadProgress returns empty progress when storage is empty or corrupt", () => {
  assert.deepEqual(loadProgress(fakeStorage()), { cards: {} });
  assert.deepEqual(loadProgress(fakeStorage({ "ml-mastery-progress-v1": "{nope" })), { cards: {} });
});

test("saved progress loads back unchanged", () => {
  const storage = fakeStorage();
  const progress = recordAnswer({ cards: {} }, "q1", true, 1000);
  assert.equal(saveProgress(progress, storage), true);
  assert.deepEqual(loadProgress(storage), progress);
});

test("saveProgress reports failure when storage throws", () => {
  const broken = { setItem: () => { throw new Error("quota"); } };
  assert.equal(saveProgress({ cards: {} }, broken), false);
});

test("recordAnswer does not mutate the previous progress", () => {
  const before = { cards: {} };
  recordAnswer(before, "q1", false, 0);
  assert.deepEqual(before, { cards: {} });
});

test("export then parse round-trips and rejects foreign files", () => {
  const progress = recordAnswer({ cards: {} }, "q1", true, 0);
  assert.deepEqual(parseExport(exportProgress(progress)), progress);
  assert.throws(() => parseExport('{"cards": {}}'), /not a progress export/);
});
