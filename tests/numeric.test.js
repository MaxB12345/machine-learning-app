import assert from "node:assert/strict";
import { test } from "node:test";
import { isNumericMatch } from "../docs/js/types/numeric.js";

test("accepts values within tolerance", () => {
  assert.equal(isNumericMatch("2.33", 2.333, 0.01), true);
  assert.equal(isNumericMatch(" 0.8909 ", 0.8909, 0.0005), true);
});

test("rejects values outside tolerance and non-numbers", () => {
  assert.equal(isNumericMatch("2.4", 2.333, 0.01), false);
  assert.equal(isNumericMatch("abc", 1, 0.1), false);
  assert.equal(isNumericMatch("", 1, 0.1), false);
});

test("zero tolerance needs an exact match", () => {
  assert.equal(isNumericMatch("4", 4, 0), true);
  assert.equal(isNumericMatch("4.1", 4, 0), false);
});
