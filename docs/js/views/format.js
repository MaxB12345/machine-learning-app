/** Human-readable labels for topics, weeks and source citations. */

const FOLDER_LABELS = {
  slides: "Slides",
  worksheet: "Worksheet",
  reading: "Reading notes",
};

/** "logit-and-odds" -> "Logit and odds". */
export function topicLabel(topic) {
  const spaced = topic.replaceAll("-", " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** "week_1/slides/1b-x.pdf", 13 -> "Slides: 1b-x, p.13". */
export function sourceLabel({ file, page }) {
  const [, folder, ...rest] = file.split("/");
  const name = rest.join("/").replace(/\.(pdf|ipynb)$/, "");
  const isNotebook = file.endsWith(".ipynb");
  const kind = isNotebook ? "Notebook" : FOLDER_LABELS[folder] ?? folder;
  const position = isNotebook ? `cell ${page}` : `p.${page}`;
  return `${kind}: ${name}, ${position}`;
}

export function percent(fraction) {
  return fraction == null ? "-" : `${Math.round(fraction * 100)}%`;
}
