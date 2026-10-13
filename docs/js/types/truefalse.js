import { choiceList } from "./choice-list.js";

const CHOICES = ["True", "False"];

/** True/false question: `answer` is a boolean. */
export default function renderTrueFalse(question, done) {
  const correctIndex = question.answer ? 0 : 1;
  return choiceList(CHOICES, { correct: new Set([correctIndex]), multi: false, done });
}
