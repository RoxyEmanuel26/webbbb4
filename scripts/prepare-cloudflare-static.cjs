const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const source = path.join(root, "out");
const destination = path.join(root, ".vercel", "output", "static");

if (!fs.existsSync(source)) {
  throw new Error("Static export was not generated. Run `next build` first.");
}

fs.rmSync(destination, { recursive: true, force: true });
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.cpSync(source, destination, { recursive: true });

const forbidden = ["_worker.js", "_worker.js.map", "functions"];
const found = forbidden.filter((name) => fs.existsSync(path.join(destination, name)));
if (found.length) throw new Error(`Worker artifacts found in static deployment: ${found.join(", ")}`);

const countFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true }).reduce(
  (total, entry) => total + (entry.isDirectory() ? countFiles(path.join(directory, entry.name)) : 1),
  0,
);

console.log(`Prepared Cloudflare static deployment: ${countFiles(destination)} files, zero Worker artifacts.`);
