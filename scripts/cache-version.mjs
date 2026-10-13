/**
 * Content-hash cache versioning for the service worker.
 * Any change to a shipped file changes the version, so installed phones
 * drop the old cache and fetch the new files without a manual version bump.
 */

import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

export const SERVICE_WORKER_FILE = "sw.js";
const CACHE_NAME_LINE = /const CACHE_NAME = "[^"]*";/;
const CACHE_NAME_PREFIX = "ml-mastery-";
const HASH_LENGTH = 8;

/** Return every file under `dir` as sorted POSIX-style relative paths. */
export function listFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) {
      found.push(relative(dir, join(entry.parentPath, entry.name)).split("\\").join("/"));
    }
  }
  return found.sort();
}

/** Return `sw.js` source with the cache name neutralised, so the name never feeds its own hash. */
function hashableServiceWorker(source) {
  return source.replace(CACHE_NAME_LINE, 'const CACHE_NAME = "";');
}

/** Hash the names and contents of every file in `docsDir`. */
export function computeVersion(docsDir) {
  const hash = createHash("sha256");
  for (const file of listFiles(docsDir)) {
    const content = readFileSync(join(docsDir, file));
    const bytes = file === SERVICE_WORKER_FILE
      ? Buffer.from(hashableServiceWorker(content.toString("utf8")))
      : content;
    hash.update(file).update("\0").update(bytes).update("\0");
  }
  return hash.digest("hex").slice(0, HASH_LENGTH);
}

/** Return `source` with the CACHE_NAME line set to `version`. Throws if the line is missing. */
export function withCacheName(source, version) {
  if (!CACHE_NAME_LINE.test(source)) {
    throw new Error('sw.js has no line like: const CACHE_NAME = "...";');
  }
  return source.replace(CACHE_NAME_LINE, `const CACHE_NAME = "${CACHE_NAME_PREFIX}${version}";`);
}
