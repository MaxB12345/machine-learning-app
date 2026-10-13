/** Usage: node scripts/bump-cache.mjs  - rewrites docs/sw.js CACHE_NAME from a content hash. */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { computeVersion, SERVICE_WORKER_FILE, withCacheName } from "./cache-version.mjs";

const docsDir = fileURLToPath(new URL("../docs/", import.meta.url));
const swPath = `${docsDir}${SERVICE_WORKER_FILE}`;

const version = computeVersion(docsDir);
const before = readFileSync(swPath, "utf8");
const after = withCacheName(before, version);

if (after === before) {
  console.log(`Cache version unchanged: ${version}`);
} else {
  writeFileSync(swPath, after);
  console.log(`Cache version bumped to ${version}`);
}
