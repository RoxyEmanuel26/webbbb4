const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");

const workflow = fs.readFileSync(
  path.join(__dirname, "../.github/workflows/refresh-discovery.yml"),
  "utf8",
);

assert.equal(
  (workflow.match(/- cron: "17 3 \* \* \*"/g) || []).length,
  1,
  "The catalog must have exactly one daily schedule",
);
assert.equal(
  workflow.includes('cron: "47 3 * * 1"'),
  false,
  "The old Monday-only expansion schedule must be removed",
);
assert.equal((workflow.match(/ai_batch=125/g) || []).length, 3);
assert.match(workflow, /SITEMAP_MAX_VIDEOS: "5000"/);
assert.match(workflow, /SITEMAP_MIN_NEW_VIDEOS: \$\{\{ steps\.publication\.outputs\.min_new \}\}/);
assert.equal((workflow.match(/min_new=100/g) || []).length, 3);
assert.match(workflow, /SITEMAP_REQUIRE_AI_CURATION: "true"/);
assert.match(workflow, /concurrency:[\s\S]*cancel-in-progress: false/);

console.log("Daily discovery workflow tests passed: at least 100 accepted videos/day, 5000 rolling maximum.");
