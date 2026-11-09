/**
 * Service worker: serve everything from cache first so the app works offline,
 * and refresh the cache in the background so updates arrive on the next open.
 */

const CACHE_NAME = "ml-mastery-4a39c682";
const SHELL_FILES = [
  "./", "index.html", "manifest.webmanifest", "css/app.css", "data/questions.json",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  "vendor/katex/katex.min.js", "vendor/katex/katex.min.css", "vendor/katex/auto-render.min.js",
  "js/main.js", "js/state.js", "js/store.js", "js/scheduler.js", "js/session.js", "js/summary.js",
  "js/dom.js", "js/math.js",
  "js/views/home.js", "js/views/week.js", "js/views/study.js", "js/views/stats.js",
  "js/views/format.js", "js/views/progress-bar.js",
  "js/types/index.js", "js/types/choice-list.js", "js/types/self-mark.js", "js/types/mcq.js",
  "js/types/multi.js", "js/types/truefalse.js", "js/types/flashcard.js", "js/types/short.js",
  "js/types/numeric.js", "js/types/order.js", "js/types/code.js",
];

/** Requests that must reach the network first, so new questions show on the next open. */
const FRESH_PATHS = ["data/questions.json"];

self.addEventListener("install", (event) => {
  const requests = SHELL_FILES.map((file) => new Request(file, { cache: "reload" }));
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(requests)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const refresh = refreshCache(event.request);
  event.waitUntil(refresh.catch(() => undefined));
  const strategy = mustBeFresh(event.request) ? networkFirst : cacheFirst;
  event.respondWith(strategy(event.request, refresh));
});

function mustBeFresh(request) {
  const path = new URL(request.url).pathname;
  return request.mode === "navigate" || FRESH_PATHS.some((fresh) => path.endsWith(fresh));
}

async function refreshCache(request) {
  const response = await fetch(request, { cache: "no-cache" });
  if (response.ok) await (await caches.open(CACHE_NAME)).put(request, response.clone());
  return response;
}

async function cached(request) {
  return (await caches.open(CACHE_NAME)).match(request, { ignoreSearch: true });
}

async function networkFirst(request, refresh) {
  try {
    return await refresh;
  } catch {
    return (await cached(request)) ?? Response.error();
  }
}

async function cacheFirst(request, refresh) {
  return (await cached(request)) ?? refresh;
}
