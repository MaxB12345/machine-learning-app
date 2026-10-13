/** Pure helpers that choose which questions a study session contains. */

import { isDue } from "./scheduler.js";

export const DEFAULT_SESSION_SIZE = 10;

/** Keep questions matching every provided filter (week, topic, type). */
export function filterQuestions(questions, { week, topic, type } = {}) {
  return questions.filter(
    (q) =>
      (week == null || q.week === week) &&
      (topic == null || q.topic === topic) &&
      (type == null || q.type === type),
  );
}

/**
 * Order questions for a session: due reviews (oldest first), then unseen
 * questions in bank order, then, if `includeNotDue`, the rest soonest-due first.
 */
export function buildQueue(questions, progress, options) {
  const { size = DEFAULT_SESSION_SIZE, now, includeNotDue = false } = options;
  const byDue = (a, b) => progress.cards[a.id].due - progress.cards[b.id].due;
  const seen = questions.filter((q) => progress.cards[q.id]);
  const reviews = seen.filter((q) => isDue(progress.cards[q.id], now)).sort(byDue);
  const unseen = questions.filter((q) => !progress.cards[q.id]);
  const later = includeNotDue
    ? seen.filter((q) => !isDue(progress.cards[q.id], now)).sort(byDue)
    : [];
  return [...reviews, ...unseen, ...later].slice(0, size);
}

/** Fisher-Yates shuffle returning a new array. */
export function shuffled(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
