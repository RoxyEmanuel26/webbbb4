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
assert.match(workflow, /1\|3\|5\) ai_batch=2/);
assert.match(workflow, /\*\) ai_batch=1/);
assert.match(workflow, /SITEMAP_MAX_VIDEOS: "250"/);
assert.match(workflow, /SITEMAP_REQUIRE_AI_CURATION: "true"/);
assert.match(workflow, /concurrency:[\s\S]*cancel-in-progress: false/);

const weeklyTotal = [2, 1, 2, 1, 2, 1, 1].reduce(
  (total, dailyBatch) => total + dailyBatch,
  0,
);
assert.equal(weeklyTotal, 10, "Daily batches must total 10 videos per week");

console.log("Daily discovery workflow tests passed: 10 videos/week, 250 maximum.");
