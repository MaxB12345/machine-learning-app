/**
 * Shared choice list for mcq, multi, truefalse and code questions.
 * `correct` is a Set of correct indexes; `multi` allows several selections.
 * Calls `done(isCorrect)` once, after the answer is locked in.
 */

import { h } from "../dom.js";
import { richText } from "../math.js";

export function choiceList(choices, { correct, multi, done }) {
  const selected = new Set();
  const buttons = choices.map((choice, index) =>
    h("button", { class: "choice", type: "button", onclick: () => pick(index) }, richText("span", choice)),
  );
  const checkButton = multi
    ? h("button", { class: "primary", type: "button", onclick: () => lockIn() }, "Check")
    : null;
  const list = h("div", { class: "choices" }, ...buttons, checkButton ?? "");

  function pick(index) {
    if (!multi) {
      selected.add(index);
      lockIn();
      return;
    }
    if (selected.has(index)) selected.delete(index);
    else selected.add(index);
    buttons[index].classList.toggle("selected", selected.has(index));
  }

  function lockIn() {
    if (selected.size === 0) return;
    buttons.forEach((button, index) => {
      button.disabled = true;
      if (correct.has(index)) button.classList.add("correct");
      else if (selected.has(index)) button.classList.add("wrong");
    });
    checkButton?.remove();
    const isCorrect = selected.size === correct.size && [...selected].every((i) => correct.has(i));
    done(isCorrect);
  }

  return list;
}
