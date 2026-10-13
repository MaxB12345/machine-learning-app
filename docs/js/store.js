/** Progress persistence. localStorage can be missing or full, so every access is guarded. */

import { nextCardState } from "./scheduler.js";

const STORAGE_KEY = "ml-mastery-progress-v1";
const EXPORT_VERSION = 1;

export function emptyProgress() {
  return { cards: {} };
}

export function loadProgress(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY));
    return parsed && typeof parsed.cards === "object" ? parsed : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

/** Save progress; returns false when the browser refused (private mode, quota). */
export function saveProgress(progress, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

/** Return a new progress object with the answer recorded. */
export function recordAnswer(progress, id, correct, now) {
  const card = nextCardState(progress.cards[id], correct, now);
  return { ...progress, cards: { ...progress.cards, [id]: card } };
}

export function exportProgress(progress) {
  return JSON.stringify({ version: EXPORT_VERSION, ...progress }, null, 1);
}

/** Parse an export; throws an Error with a clear message when it is not valid. */
export function parseExport(text) {
  const data = JSON.parse(text);
  if (data.version !== EXPORT_VERSION || typeof data.cards !== "object") {
    throw new Error("This file is not a progress export from this app.");
  }
  return { cards: data.cards };
}
