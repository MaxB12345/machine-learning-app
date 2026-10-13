/** Pure progress statistics over a list of questions. */

import { isDue, isMastered } from "./scheduler.js";

/** Count totals, due, mastered and overall accuracy for `questions`. */
export function summarise(questions, progress, now) {
  let seen = 0, due = 0, mastered = 0, attempts = 0, correct = 0;
  for (const question of questions) {
    const card = progress.cards[question.id];
    if (card) {
      seen += 1;
      attempts += card.seen;
      correct += card.correct;
    }
    if (card && isDue(card, now)) due += 1;
    if (isMastered(card)) mastered += 1;
  }
  const unseen = questions.length - seen;
  const accuracy = attempts ? correct / attempts : null;
  return { total: questions.length, seen, unseen, due, mastered, accuracy };
}

/** Group questions by a key function, preserving first-seen order. */
export function groupBy(questions, keyOf) {
  const groups = new Map();
  for (const question of questions) {
    const key = keyOf(question);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(question);
  }
  return groups;
}
