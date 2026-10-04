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

assert.equal((workflow.match(/- cron: "17 19 \* \* \*"/g) || []).length, 1, "There must be one daily 02:17 WIB trigger");
assert.match(workflow, /workflow_dispatch:/, "Manual maintenance must remain available");
assert.equal((workflow.match(/ai_batch=15/g) || []).length, 2);
assert.equal((workflow.match(/ai_batch=125/g) || []).length, 1);
assert.match(workflow, /SITEMAP_MAX_VIDEOS: "4000"/);
assert.match(workflow, /SITEMAP_MIN_NEW_VIDEOS: \$\{\{ steps\.publication\.outputs\.min_new \}\}/);
assert.match(workflow, /SITEMAP_REVALIDATE_BATCH_SIZE: "50"/);
assert.equal((workflow.match(/min_new=10\r?$/gm) || []).length, 2);
assert.equal((workflow.match(/min_new=100/g) || []).length, 1);
assert.match(workflow, /SITEMAP_REQUIRE_AI_CURATION: "true"/);
assert.match(workflow, /EVENT_SCHEDULE: \$\{\{ github\.event\.schedule \}\}/);
assert.match(workflow, /npm run validate:sitemap/);
assert.match(workflow, /npm run test:seo-render/);
assert.match(workflow, /git pull --rebase origin main/);
assert.match(workflow, /concurrency:[\s\S]*cancel-in-progress: false/);
assert.match(generator, /const MIN_DESCRIPTION_LENGTH = 80;/);
assert.match(generator, /const MAX_DESCRIPTION_LENGTH = 320;/);
assert.match(generator, /140–180 characters preferred/);

console.log("Workflow tests passed: one small daily batch at 02:17 WIB, manual recovery, validation, and 4000-page ceiling.");
