import assert from "node:assert/strict";
import { test } from "node:test";
import { buildQueue, filterQuestions, shuffled } from "../docs/js/session.js";

const questions = [
  { id: "a", week: 1, topic: "t1", type: "mcq" },
  { id: "b", week: 1, topic: "t2", type: "numeric" },
  { id: "c", week: 2, topic: "t1", type: "mcq" },
  { id: "d", week: 2, topic: "t3", type: "short" },
];

test("filterQuestions applies week, topic and type together", () => {
  assert.deepEqual(filterQuestions(questions, { week: 1 }).map((q) => q.id), ["a", "b"]);
  assert.deepEqual(filterQuestions(questions, { topic: "t1", type: "mcq" }).map((q) => q.id), ["a", "c"]);
  assert.equal(filterQuestions(questions).length, 4);
});

test("queue puts due reviews first, then unseen, and skips not-due cards", () => {
  const progress = { cards: { a: { box: 1, due: 50 }, b: { box: 2, due: 10 }, c: { box: 1, due: 999 } } };
  const queue = buildQueue(questions, progress, { size: 10, now: 100 });
  assert.deepEqual(queue.map((q) => q.id), ["b", "a", "d"]);
});

test("includeNotDue appends future cards soonest first", () => {
  const progress = { cards: { c: { box: 1, due: 999 }, a: { box: 1, due: 500 } } };
  const queue = buildQueue(questions, progress, { size: 10, now: 100, includeNotDue: true });
  assert.deepEqual(queue.map((q) => q.id), ["b", "d", "a", "c"]);
});

test("queue is capped at the session size", () => {
  const queue = buildQueue(questions, { cards: {} }, { size: 2, now: 0 });
  assert.equal(queue.length, 2);
});

test("shuffled keeps the same items and does not mutate the input", () => {
  const input = [1, 2, 3, 4, 5];
  const result = shuffled(input, () => 0.3);
  assert.deepEqual([...result].sort(), input);
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
});
