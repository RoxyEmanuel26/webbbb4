const fs = require('fs');
const path = require('path');
const https = require('https');

const HOST = 'www.nicevx.com';
const DEFAULT_KEY = '41e428d022b7405f8899fa0e89104081';
const KEY = String(process.env.INDEXNOW_KEY || DEFAULT_KEY).trim();
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const publicDir = path.join(__dirname, '../public');
const sitemapsDir = path.join(publicDir, 'sitemaps');

function getUrlsFromXml(xml) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1]);
}

function collectUrls() {
  const urls = new Set();

  if (fs.existsSync(sitemapsDir)) {
    const files = fs.readdirSync(sitemapsDir).filter((f) => f.endsWith('.xml'));
    for (const file of files) {
      const xml = fs.readFileSync(path.join(sitemapsDir, file), 'utf8');
      for (const url of getUrlsFromXml(xml)) {
        urls.add(url);
      }
    }
  }

  return [...urls];
}

async function submitIndexNow(urlList) {
  if (!urlList.length) {
    console.log('IndexNow: No URLs to submit.');
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

  return new Promise((resolve, reject) => {
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
            resolve(); // Do not fail the build if IndexNow endpoint is momentarily throttling
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
    const urls = collectUrls();
    console.log(`IndexNow: Collected ${urls.length} canonical URLs for ${HOST}.`);
    await submitIndexNow(urls);
  } catch (err) {
    console.error('IndexNow submission error:', err);
  }
})();
