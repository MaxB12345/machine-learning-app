import { choiceList } from "./choice-list.js";

/** Single-choice question: `answer` is the index of the right choice. */
export default function renderMcq(question, done) {
  return choiceList(question.choices, { correct: new Set([question.answer]), multi: false, done });
}
