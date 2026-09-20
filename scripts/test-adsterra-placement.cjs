const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const layout = read("src/app/layout.jsx");
const video = read("src/app/video/[...slug]/page.jsx");

assert.match(layout, /6b5f74f06f7a6a6df37d65cea9803a1d\.js/);
assert.doesNotMatch(layout, /c5d4ca9c6ad3af9bb2af16d5405c0a02\.js/);
assert.match(video, /c5d4ca9c6ad3af9bb2af16d5405c0a02\.js/);
assert.match(layout, /data-cfasync="false"/);
assert.match(video, /data-cfasync="false"/);

console.log("Adsterra placement passed: Social Bar global, Popunder video-only, Cloudflare-safe attributes present.");
