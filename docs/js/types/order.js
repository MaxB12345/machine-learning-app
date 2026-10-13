import { h } from "../dom.js";
import { richText } from "../math.js";
import { shuffled } from "../session.js";

/** Arrange steps: tap pieces in order. `steps` holds the correct order. */
export default function renderOrder(question, done) {
  const order = shuffled(question.steps.map((_, index) => index));
  const picked = [];
  const slots = h("ol", { class: "steps picked" });
  const pool = h("div", { class: "choices" });
  const check = h("button", { class: "primary", type: "button", onclick: finish }, "Check");
  check.disabled = true;

  order.forEach((stepIndex) => {
    const button = h("button", { class: "choice", type: "button", onclick: () => take(stepIndex, button) },
      richText("span", question.steps[stepIndex]));
    pool.append(button);
  });

  function take(stepIndex, button) {
    picked.push(stepIndex);
    button.disabled = true;
    slots.append(h("li", {}, richText("span", question.steps[stepIndex])));
    check.disabled = picked.length < order.length;
  }

  function finish() {
    const correct = picked.every((stepIndex, position) => stepIndex === position);
    check.remove();
    pool.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    const answer = h("ol", { class: "steps" }, ...question.steps.map((s) => h("li", {}, richText("span", s))));
    done(correct, { answerNode: answer });
  }

  return h("div", {}, slots, pool, check);
}
