import { choiceList } from "./choice-list.js";

/** Select-all-that-apply: `answer` is a list of correct indexes. */
export default function renderMulti(question, done) {
  return choiceList(question.choices, { correct: new Set(question.answer), multi: true, done });
}
