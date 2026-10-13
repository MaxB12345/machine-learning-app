import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_BOX, isDue, isMastered, nextCardState } from "../docs/js/scheduler.js";

const DAY = 24 * 60 * 60 * 1000;

test("first correct answer moves a new card to box 1, due in a day", () => {
  const card = nextCardState(undefined, true, 0);
  assert.equal(card.box, 1);
  assert.equal(card.due, DAY);
  assert.equal(card.seen, 1);
  assert.equal(card.correct, 1);
});

test("a wrong answer resets the card to box 0 and keeps counts", () => {
  const card = nextCardState({ box: 3, due: 0, seen: 5, correct: 4 }, false, 100);
  assert.equal(card.box, 0);
  assert.equal(card.due, 100);
  assert.equal(card.seen, 6);
  assert.equal(card.correct, 4);
});

test("box never exceeds the maximum", () => {
  const card = nextCardState({ box: MAX_BOX, due: 0, seen: 9, correct: 9 }, true, 0);
  assert.equal(card.box, MAX_BOX);
});

test("unseen cards are due, future cards are not", () => {
  assert.equal(isDue(undefined, 0), true);
  assert.equal(isDue({ box: 1, due: 10 }, 5), false);
  assert.equal(isDue({ box: 1, due: 10 }, 10), true);
});

test("mastered means box 4 or above", () => {
  assert.equal(isMastered({ box: 3 }), false);
  assert.equal(isMastered({ box: 4 }), true);
  assert.equal(isMastered(undefined), false);
});
