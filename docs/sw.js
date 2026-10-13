/**
 * Service worker: serve everything from cache first so the app works offline,
 * and refresh the cache in the background so updates arrive on the next open.
 */

const CACHE_NAME = "ml-mastery-3034dbb6";
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

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)));
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
  event.respondWith(staleWhileRevalidate(event.request));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? refresh;
}
