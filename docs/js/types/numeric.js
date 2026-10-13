import { h } from "../dom.js";

/** Whether `typed` is within `tolerance` of `expected`. Returns false for non-numbers. */
export function isNumericMatch(typed, expected, tolerance) {
  const value = Number.parseFloat(String(typed).trim());
  return Number.isFinite(value) && Math.abs(value - expected) <= tolerance + Number.EPSILON;
}

/** Typed numeric answer, accepted within the question's tolerance. */
export default function renderNumeric(question, done) {
  const input = h("input", { type: "text", inputmode: "decimal", autocomplete: "off", placeholder: "Your answer" });
  const button = h("button", { class: "primary", type: "button", onclick: check }, "Check");

  function check() {
    if (!input.value.trim()) return;
    const correct = isNumericMatch(input.value, question.answer, question.tolerance);
    input.disabled = true;
    button.remove();
    done(correct, { answerText: `${question.answer}` });
  }

  input.addEventListener("keydown", (event) => { if (event.key === "Enter") check(); });
  return h("div", { class: "numeric" }, input, button);
}
