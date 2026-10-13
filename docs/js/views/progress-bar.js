import { h } from "../dom.js";

/** Stacked bar: mastered / seen-but-not-mastered / unseen. */
export function progressBar({ total, seen, mastered }) {
  const share = (count) => (total ? (count / total) * 100 : 0);
  return h("div", { class: "bar", role: "img", "aria-label": `${mastered} of ${total} mastered` },
    h("span", { class: "bar-mastered", style: `width:${share(mastered)}%` }),
    h("span", { class: "bar-seen", style: `width:${share(seen - mastered)}%` }));
}

export function statLine(summary) {
  return `${summary.mastered}/${summary.total} mastered · ${summary.due} due · ${summary.unseen} new`;
}
