/**
 * Reveal-then-self-mark flow for flashcard and short-answer questions.
 * The learner reveals the model answer, then rates themselves.
 */

import { h } from "../dom.js";
import { richText } from "../math.js";

export function selfMark(question, done) {
  const steps = question.steps ?? [];
  const container = h("div", { class: "self-mark" });
  const reveal = h("button", { class: "primary", type: "button", onclick: showAnswer }, "Show answer");
  container.append(reveal);

  function showAnswer() {
    const stepList = steps.length
      ? h("ol", { class: "steps" }, ...steps.map((step) => h("li", {}, richText("span", step))))
      : "";
    container.replaceChildren(
      h("div", { class: "model-answer" }, richText("div", question.answer), stepList),
      h("p", { class: "hint" }, "Did you get it?"),
      h("div", { class: "row" },
        h("button", { class: "choice wrong-btn", type: "button", onclick: () => finish(false) }, "Missed it"),
        h("button", { class: "choice correct-btn", type: "button", onclick: () => finish(true) }, "Got it")),
    );
  }

  function finish(correct) {
    container.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    done(correct);
  }

  return container;
}
