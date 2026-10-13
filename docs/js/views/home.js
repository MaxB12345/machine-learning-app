import { h, show } from "../dom.js";
import { state } from "../state.js";
import { groupBy, summarise } from "../summary.js";
import { progressBar, statLine } from "./progress-bar.js";

/** Home: one card per week plus a review-everything shortcut. */
export function renderHome(root) {
  const now = Date.now();
  const weeks = groupBy(state.questions, (q) => q.week);
  const overall = summarise(state.questions, state.progress, now);
  const cards = [...weeks].sort(([a], [b]) => a - b).map(([week, questions]) => {
    const summary = summarise(questions, state.progress, now);
    return h("a", { class: "card", href: `#/week/${week}` },
      h("h2", {}, `Week ${week}`),
      progressBar(summary),
      h("p", { class: "meta" }, statLine(summary)));
  });
  show(root,
    h("header", {}, h("h1", {}, "ML Mastery"), h("a", { class: "link", href: "#/stats" }, "Stats")),
    h("a", { class: "primary block", href: "#/study?mode=due&size=15" },
      `Review due (${overall.due} due, ${overall.unseen} new)`),
    ...cards);
}
