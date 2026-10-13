/** The single in-memory app state: question bank and learner progress. */

import { recordAnswer, loadProgress, saveProgress } from "./store.js";

export const state = { questions: [], progress: loadProgress() };

export async function loadQuestions(url = "data/questions.json") {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load questions (${response.status})`);
  state.questions = await response.json();
}

/** Record an answer, persist it, and return whether storage accepted it. */
export function commitAnswer(id, correct, now = Date.now()) {
  state.progress = recordAnswer(state.progress, id, correct, now);
  return saveProgress(state.progress);
}

export function replaceProgress(progress) {
  state.progress = progress;
  return saveProgress(progress);
}
