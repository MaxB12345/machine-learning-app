import { h } from "../dom.js";
import { choiceList } from "./choice-list.js";

/** A code snippet followed by a single-choice question about it. */
export default function renderCode(question, done) {
  const snippet = h("pre", { class: "snippet" }, h("code", {}, question.code));
  const choices = choiceList(question.choices, { correct: new Set([question.answer]), multi: false, done });
  return h("div", {}, snippet, choices);
}
