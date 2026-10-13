/** App entry: loads data, registers the service worker and routes on the URL hash. */

import { loadQuestions } from "./state.js";
import { h, show } from "./dom.js";
import { renderHome } from "./views/home.js";
import { renderStats } from "./views/stats.js";
import { renderStudy } from "./views/study.js";
import { renderWeek } from "./views/week.js";

const root = document.getElementById("app");

function parseHash() {
  const [path, query = ""] = location.hash.replace(/^#\/?/, "").split("?");
  return { parts: path.split("/").filter(Boolean), params: new URLSearchParams(query) };
}

function studyOptions(params) {
  const number = (value) => (value == null ? undefined : Number(value));
  return {
    week: number(params.get("week")),
    topic: params.get("topic") ?? undefined,
    type: params.get("type") ?? undefined,
    mode: params.get("mode") ?? "due",
    size: number(params.get("size")) ?? 10,
  };
}

function route() {
  const { parts, params } = parseHash();
  if (parts[0] === "week") return renderWeek(root, Number(parts[1]), params.get("type"));
  if (parts[0] === "study") return renderStudy(root, studyOptions(params));
  if (parts[0] === "stats") return renderStats(root);
  return renderHome(root);
}

async function start() {
  try {
    await loadQuestions();
    window.addEventListener("hashchange", route);
    route();
  } catch (error) {
    show(root, h("p", { class: "verdict bad" }, `Could not start: ${error.message}`));
  }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch((error) => console.warn("Service worker failed", error));
  }
}

start();
