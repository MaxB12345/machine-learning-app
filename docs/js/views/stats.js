import { h, show } from "../dom.js";
import { exportProgress, parseExport } from "../store.js";
import { replaceProgress, state } from "../state.js";
import { groupBy, summarise } from "../summary.js";
import { percent, topicLabel } from "./format.js";

/** Stats page: per-topic accuracy and progress backup (export/import). */
export function renderStats(root) {
  const now = Date.now();
  const rows = [...groupBy(state.questions, (q) => `${q.week}|${q.topic}`)].map(([key, questions]) => {
    const [week, topic] = key.split("|");
    const summary = summarise(questions, state.progress, now);
    return h("tr", {}, h("td", {}, `W${week} ${topicLabel(topic)}`),
      h("td", {}, percent(summary.accuracy)), h("td", {}, `${summary.mastered}/${summary.total}`));
  });
  const status = h("p", { class: "meta" });
  show(root,
    h("header", {}, h("a", { class: "link", href: "#/" }, "‹ Home"), h("h1", {}, "Stats")),
    h("table", {}, h("thead", {}, h("tr", {}, h("th", {}, "Topic"), h("th", {}, "Accuracy"), h("th", {}, "Mastered"))),
      h("tbody", {}, ...rows)),
    h("h2", {}, "Backup"),
    h("p", { class: "meta" }, "Phone storage can be cleared by the system. Export your progress now and then."),
    h("button", { class: "primary", type: "button", onclick: () => downloadProgress() }, "Export progress"),
    importControl(status),
    status);
}

function downloadProgress() {
  const blob = new Blob([exportProgress(state.progress)], { type: "application/json" });
  const link = h("a", { href: URL.createObjectURL(blob), download: "ml-mastery-progress.json" });
  link.click();
  URL.revokeObjectURL(link.href);
}

function importControl(status) {
  const input = h("input", { type: "file", accept: "application/json" });
  input.addEventListener("change", async () => {
    try {
      const imported = parseExport(await input.files[0].text());
      status.textContent = replaceProgress(imported)
        ? `Imported ${Object.keys(imported.cards).length} cards.`
        : "Imported, but this browser would not save it.";
    } catch (error) {
      status.textContent = `Import failed: ${error.message}`;
    }
  });
  return h("label", { class: "file" }, "Import progress ", input);
}
