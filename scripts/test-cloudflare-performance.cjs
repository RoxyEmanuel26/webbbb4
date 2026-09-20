const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const staticDynamicRoutes = [
  "src/app/video/[...slug]/page.jsx",
  "src/app/collections/[slug]/page.jsx",
  "src/app/cat/[catName]/page.jsx",
  "src/app/tag/[tagName]/page.jsx",
];

for (const route of staticDynamicRoutes) {
  const source = read(route);
  assert.match(source, /export function generateStaticParams\(/, `${route} must pre-render its finite route inventory`);
  assert.match(source, /export const dynamicParams = false/, `${route} must reject non-generated paths without SSR fallback`);
  assert.doesNotMatch(source, /export const runtime\s*=\s*["']edge["']/, `${route} must not execute in the Worker`);
}

const appSources = fs
  .readdirSync(path.join(root, "src/app"), { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.(js|jsx)$/.test(entry.name))
  .map((entry) => path.join(entry.parentPath || entry.path, entry.name));

for (const absolutePath of appSources) {
  const relativePath = path.relative(root, absolutePath).replaceAll("\\", "/");
  assert.doesNotMatch(
    fs.readFileSync(absolutePath, "utf8"),
    /export const runtime\s*=\s*["']edge["']/,
    `${relativePath} unexpectedly opts into Edge SSR`,
  );
}

assert.match(read("src/app/tag/[tagName]/page.jsx"), /\.slice\(0, 250\)/);
assert.match(read("src/app/page.jsx"), /featured\.length < 180/);

assert.equal(
  fs.existsSync(path.join(root, "src/app/api/eporner/route.js")),
  false,
  "The unused public Eporner proxy must stay removed; search fetches the provider from the browser",
);
assert.match(read("next.config.mjs"), /output:\s*["']export["']/);
assert.doesNotMatch(read("package.json"), /@cloudflare\/next-on-pages/);
assert.match(read("package.json"), /prepare-cloudflare-static\.cjs/);
assert.match(read("scripts/prepare-cloudflare-static.cjs"), /zero Worker artifacts/);
assert.doesNotMatch(read("next.config.mjs"), /Cache-Control[^\n]*no-store/);
assert.doesNotMatch(read("public/_headers"), /Cache-Control:\s*no-store/);

console.log("Cloudflare performance gates passed: pure static export, bounded client feed, and zero request-time application routes.");
