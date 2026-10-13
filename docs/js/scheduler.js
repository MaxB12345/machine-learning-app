/**
 * Leitner-style spaced repetition: each question sits in a box 0..5.
 * A correct answer moves it up a box (longer wait), a wrong one resets it.
 */

export const BOX_INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];
export const MAX_BOX = BOX_INTERVAL_DAYS.length - 1;
export const MASTERED_BOX = 4;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Return the new state of a card after one answer. `card` may be undefined. */
export function nextCardState(card, correct, now) {
  const box = correct ? Math.min((card?.box ?? 0) + 1, MAX_BOX) : 0;
  return {
    box,
    due: now + BOX_INTERVAL_DAYS[box] * MS_PER_DAY,
    seen: (card?.seen ?? 0) + 1,
    correct: (card?.correct ?? 0) + (correct ? 1 : 0),
  };
}

/** A question is due if it was never answered or its due time has passed. */
export function isDue(card, now) {
  return !card || card.due <= now;
}

export function isMastered(card) {
  return Boolean(card) && card.box >= MASTERED_BOX;
}
