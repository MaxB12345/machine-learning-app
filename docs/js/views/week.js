import { h, show } from "../dom.js";
import { state } from "../state.js";
import { filterQuestions } from "../session.js";
import { groupBy, summarise } from "../summary.js";
import { TYPE_LABELS } from "../types/index.js";
import { progressBar, statLine } from "./progress-bar.js";
import { topicLabel } from "./format.js";

/** Week page: start the whole week or a single topic, optionally one question type. */
export function renderWeek(root, week, selectedType) {
  const now = Date.now();
  const inWeek = filterQuestions(state.questions, { week });
  const typeParam = selectedType ? `&type=${selectedType}` : "";
  const topics = [...groupBy(filterQuestions(inWeek, { type: selectedType }), (q) => q.topic)];
  const cards = topics.map(([topic, questions]) => {
    const summary = summarise(questions, state.progress, now);
    return h("a", { class: "card", href: `#/study?week=${week}&topic=${topic}${typeParam}` },
      h("h2", {}, topicLabel(topic)),
      progressBar(summary),
      h("p", { class: "meta" }, statLine(summary)));
  });
  show(root,
    h("header", {}, h("a", { class: "link", href: "#/" }, "‹ Home"), h("h1", {}, `Week ${week}`)),
    h("a", { class: "primary block", href: `#/study?week=${week}&mode=due&size=15${typeParam}` }, "Study this week"),
    typeFilter(week, inWeek, selectedType),
    ...cards);
}

function typeFilter(week, questions, selectedType) {
  const types = [...new Set(questions.map((q) => q.type))];
  const chip = (type, label) => h("a", {
    class: `chip${selectedType === type ? " active" : ""}`,
    href: type ? `#/week/${week}?type=${type}` : `#/week/${week}`,
  }, label);
  return h("div", { class: "chips" }, chip(null, "All types"),
    ...types.map((type) => chip(type, TYPE_LABELS[type] ?? type)));
}
