import { h, show } from "../dom.js";
import { richText } from "../math.js";
import { buildQueue, filterQuestions } from "../session.js";
import { commitAnswer, state } from "../state.js";
import { TYPE_LABELS, renderQuestion } from "../types/index.js";
import { sourceLabel, topicLabel } from "./format.js";

/** Run a study session. `options`: {week, topic, type, mode, size}. */
export function renderStudy(root, options) {
  const pool = filterQuestions(state.questions, options);
  const queue = buildQueue(pool, state.progress, {
    size: options.size,
    now: Date.now(),
    includeNotDue: options.mode === "all",
  });
  if (queue.length === 0) return renderNothingDue(root, options);
  const run = { queue, index: 0, firstTry: 0, retried: new Set() };
  showQuestion(root, run, options);
}

function renderNothingDue(root, options) {
  const defined = Object.entries({ ...options, mode: "all" }).filter(([, value]) => value != null);
  const params = new URLSearchParams(defined);
  show(root,
    h("header", {}, h("a", { class: "link", href: "#/" }, "‹ Home")),
    h("p", {}, "Nothing is due right now."),
    h("a", { class: "primary block", href: `#/study?${params}` }, "Practise anyway"));
}

function showQuestion(root, run, options) {
  const question = run.queue[run.index];
  const isRetry = run.retried.has(question.id);
  const feedback = h("div", { class: "feedback" });
  const done = (correct, extra = {}) => {
    if (!isRetry) {
      commitAnswer(question.id, correct);
      if (correct) run.firstTry += 1;
    }
    if (!correct && !isRetry) {
      run.retried.add(question.id);
      run.queue.push(question);
    }
    feedback.replaceChildren(...feedbackNodes(question, correct, extra, () => advance(root, run, options)));
    feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  show(root,
    h("header", {}, h("a", { class: "link", href: "#/" }, "‹ Quit"),
      h("span", { class: "meta" }, `${run.index + 1} / ${run.queue.length}`)),
    h("p", { class: "meta" }, `${TYPE_LABELS[question.type]} · ${topicLabel(question.topic)}${isRetry ? " · retry" : ""}`),
    richText("h2", question.prompt, { class: "prompt" }),
    renderQuestion(question, done),
    feedback);
}

function feedbackNodes(question, correct, extra, onNext) {
  const verdict = h("p", { class: correct ? "verdict ok" : "verdict bad" }, correct ? "Correct" : "Not quite");
  const answer = extra.answerText ? h("p", {}, `Answer: ${extra.answerText}`) : extra.answerNode ?? "";
  const sources = h("p", { class: "meta" }, "Source: ", question.sources.map(sourceLabel).join("; "));
  return [verdict, answer, richText("p", question.explanation), sources,
    h("button", { class: "primary", type: "button", onclick: onNext }, "Next")];
}

function advance(root, run, options) {
  run.index += 1;
  if (run.index < run.queue.length) return showQuestion(root, run, options);
  const total = run.queue.length - run.retried.size;
  show(root,
    h("h1", {}, "Session complete"),
    h("p", {}, `${run.firstTry} of ${total} correct first time.`),
    h("a", { class: "primary block", href: "#/" }, "Back to home"));
}
