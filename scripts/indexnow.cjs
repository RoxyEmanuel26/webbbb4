const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');

const HOST = 'www.nicevx.com';
const DEFAULT_KEY = '41e428d022b7405f8899fa0e89104081';
const KEY = String(process.env.INDEXNOW_KEY || DEFAULT_KEY).trim();
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const sitemapsDir = path.join(publicDir, 'sitemaps');
const submitAll = process.argv.includes('--all');
const baseRef = String(process.env.INDEXNOW_BASE_REF || 'HEAD~1').trim();

function parseUrlEntriesFromXml(xml) {
  const entries = new Map();
  for (const block of String(xml || '').matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = block[1].match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
    if (!loc) continue;
    const lastmod = block[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() || '';
    entries.set(loc, lastmod);
  }
  return entries;
}

function collectCurrentUrlMap() {
  const entries = new Map();
  if (fs.existsSync(sitemapsDir)) {
    const files = fs.readdirSync(sitemapsDir).filter((f) => f.endsWith('.xml')).sort();
    for (const file of files) {
      const xml = fs.readFileSync(path.join(sitemapsDir, file), 'utf8');
      for (const [loc, lastmod] of parseUrlEntriesFromXml(xml)) {
        entries.set(loc, lastmod);
      }
    }
  }
  return entries;
}

function hasGitRef(ref) {
  try {
    execFileSync('git', ['rev-parse', '--verify', ref], { cwd: rootDir, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function readGitFile(ref, relPath) {
  try {
    return execFileSync('git', ['show', `${ref}:${relPath}`], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function collectChangedUrls() {
  const currentMap = collectCurrentUrlMap();
  if (submitAll) {
    return [...currentMap.keys()];
  }

  if (!hasGitRef(baseRef)) {
    console.warn(`IndexNow: Git ref ${baseRef} unavailable; selecting newest 50 URLs by lastmod.`);
    return [...currentMap.entries()]
      .sort((a, b) => (Date.parse(b[1]) || 0) - (Date.parse(a[1]) || 0))
      .slice(0, 50)
      .map(([loc]) => loc);
  }

  const prevMap = new Map();
  const prevFilesOut = (() => {
    try {
      return execFileSync('git', ['ls-tree', '-r', '--name-only', baseRef, 'public/sitemaps'], {
        cwd: rootDir,
        encoding: 'utf8',
      });
    } catch {
      return '';
    }
  })();

  for (const relPath of prevFilesOut.split(/\r?\n/).filter((f) => f.endsWith('.xml'))) {
    const xml = readGitFile(baseRef, relPath);
    if (!xml) continue;
    for (const [loc, lastmod] of parseUrlEntriesFromXml(xml)) {
      prevMap.set(loc, lastmod);
    }
  }

  const changed = [];
  for (const [loc, lastmod] of currentMap.entries()) {
    if (!prevMap.has(loc) || prevMap.get(loc) !== lastmod) {
      changed.push(loc);
    }
  }
  return changed;
}

async function submitIndexNow(urlList) {
  if (!urlList.length) {
    console.log('IndexNow: No changed URLs to submit (skipping unchanged URLs).');
    return;
  }

  // IndexNow accepts max 10,000 URLs per post
  const batch = urlList.slice(0, 10000);
  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: batch,
  });

  return new Promise((resolve) => {
    const req = https.request(
      'https://api.indexnow.org/indexnow',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 202) {
            console.log(`IndexNow submitted successfully: ${batch.length} URLs (HTTP ${res.statusCode}).`);
            resolve();
          } else {
            console.warn(`IndexNow returned HTTP ${res.statusCode}: ${data}`);
            resolve();
          }
        });
      }
    );

    req.on('error', (err) => {
      console.warn(`IndexNow ping warning: ${err.message}`);
      resolve();
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.warn('IndexNow request timed out.');
      resolve();
    });

    req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const urls = collectChangedUrls();
    const modeLabel = submitAll ? '--all' : `--changed vs ${baseRef}`;
    console.log(`IndexNow (${modeLabel}): Prepared ${urls.length} URLs for ${HOST}.`);
    await submitIndexNow(urls);
  } catch (err) {
    console.error('IndexNow submission error:', err);
  }
})();
