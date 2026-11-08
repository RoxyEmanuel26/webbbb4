const fs = require('fs');
const path = require('path');

const API_REMOVED = 'https://www.eporner.com/api/v2/video/removed/';

async function syncRemoved() {
  console.log('🔍 Fetching removed video IDs from Eporner API...');
  try {
    const res = await fetch(API_REMOVED);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const text = await res.text();
    const removedIds = new Set(
      text
        .split(/\r?\n/)
        .map((id) => id.trim())
        .filter(Boolean)
    );
    console.log(`📡 Total removed videos in Eporner database: ${removedIds.size.toLocaleString()}`);

    const catalogPath = path.join(__dirname, '../src/data/curated-video-catalog.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const matchedRemoved = catalog.videos.filter((v) => removedIds.has(v.id));

    console.log(`⚠️ Matched in local catalog: ${matchedRemoved.length} / ${catalog.videos.length} videos`);

    const auditData = {
      auditedAt: new Date().toISOString(),
      totalEpornerRemoved: removedIds.size,
      catalogSize: catalog.videos.length,
      matchedCount: matchedRemoved.length,
      matchedVideos: matchedRemoved.map((v) => ({
        id: v.id,
        title: v.title,
        canonicalSlug: v.canonicalSlug,
        category: v.category,
      })),
    };

    const docsDir = path.join(__dirname, '../docs');
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
    const auditFile = path.join(docsDir, 'eporner_removed_audit.json');
    fs.writeFileSync(auditFile, JSON.stringify(auditData, null, 2), 'utf8');
    console.log(`📄 Saved audit report to docs/eporner_removed_audit.json`);

    return auditData;
  } catch (err) {
    console.error('❌ Failed to sync removed videos:', err.message);
  }
}

if (require.main === module) {
  syncRemoved();
}

module.exports = { syncRemoved };
