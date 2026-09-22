const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");

const workflow = fs.readFileSync(
  path.join(__dirname, "../.github/workflows/refresh-discovery.yml"),
  "utf8",
);
const generator = fs.readFileSync(
  path.join(__dirname, "generate-sitemap.cjs"),
  "utf8",
);

assert.doesNotMatch(workflow, /^\s*schedule:/m, "Catalog refresh must not run on a GitHub schedule");
assert.doesNotMatch(workflow, /cron:/, "No automatic cron trigger may remain");
assert.match(workflow, /workflow_dispatch:/, "Manual maintenance must remain available");
assert.equal((workflow.match(/ai_batch=125/g) || []).length, 2);
assert.match(workflow, /SITEMAP_MAX_VIDEOS: "8500"/);
assert.match(workflow, /SITEMAP_MIN_NEW_VIDEOS: \$\{\{ steps\.publication\.outputs\.min_new \}\}/);
assert.equal((workflow.match(/min_new=100/g) || []).length, 2);
assert.match(workflow, /SITEMAP_REQUIRE_AI_CURATION: "true"/);
assert.doesNotMatch(workflow, /EVENT_SCHEDULE|github\.event\.schedule|TZ=Asia\/Jakarta/);
assert.match(workflow, /concurrency:[\s\S]*cancel-in-progress: false/);
assert.match(generator, /const MIN_DESCRIPTION_LENGTH = 80;/);
assert.match(generator, /const MAX_DESCRIPTION_LENGTH = 320;/);
assert.match(generator, /140–180 characters preferred/);

console.log("Workflow tests passed: automatic schedules disabled; manual preservation-first maintenance remains available.");
