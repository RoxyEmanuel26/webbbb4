const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const API_VIDEO_ID = 'https://www.eporner.com/api/v2/video/id/';
const CATALOG_PATH = path.join(__dirname, '../src/data/curated-video-catalog.json');
const SNAPSHOTS_PATH = path.join(__dirname, '../src/data/discovery-snapshots.json');
const AUDIT_PATH = path.join(__dirname, '../docs/eporner_removed_audit.json');

const CONCURRENCY = Number.parseInt(process.env.SYNC_CONCURRENCY || '', 10) || 8;
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const MAX_SAFE_PRUNE_RATIO = 0.4; // Safety breaker against upstream outage

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isoDuration(seconds) {
  const duration = Number.parseInt(seconds, 10) || 0;
  if (!duration) return null;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const remainingSeconds = duration % 60;
  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${remainingSeconds ? `${remainingSeconds}S` : ''}`;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function checkThumbnailAlive(url) {
  if (!url) return false;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetchWithTimeout(url, { method: 'HEAD' });
      if (res.status === 404 || res.status === 410) return false;
      if (res.ok || res.status === 403 || res.status === 405) return true;
    } catch (_) {}
    if (attempt < 2) await sleep(350);
  }
  // Treat uncertain CDN timeout as alive to avoid false positives
  return true;
}

async function verifyVideoOnEporner(video) {
  const url = `${API_VIDEO_ID}?id=${encodeURIComponent(video.id)}&thumbsize=big&format=json`;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      if (res.status === 429 || res.status >= 500) {
        if (attempt < MAX_RETRIES) {
          await sleep(attempt * 1200);
          continue;
        }
        return { status: 'error', reason: `http_${res.status}` };
      }
      if (!res.ok) {
        return { status: 'error', reason: `http_${res.status}` };
      }
      const data = await res.json();
      // Per Eporner API v2 spec: deleted/removed video returns empty array []
      if (!data || Array.isArray(data) || !data.id || !data.embed || !data.default_thumb?.src) {
        return { status: 'dead', reason: 'eporner_removed' };
      }
      const thumbAlive = await checkThumbnailAlive(data.default_thumb.src);
      if (!thumbAlive) {
        return { status: 'dead', reason: 'thumbnail_404' };
      }
      return { status: 'alive', fresh: data };
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        await sleep(attempt * 900);
        continue;
      }
      return { status: 'error', reason: err.name === 'AbortError' ? 'timeout' : 'network_error' };
    }
  }
  return { status: 'error', reason: 'retries_exhausted' };
}

async function syncRemoved(options = {}) {
  const dryRun = options.dryRun ?? process.argv.includes('--dry-run');
  const skipRebuild = options.skipRebuild ?? process.argv.includes('--no-rebuild');
  const runTimestamp = new Date().toISOString();

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const videos = Array.isArray(catalog.videos) ? catalog.videos : [];
  console.log(`[Sync] Verifying ${videos.length} catalog videos against Eporner API v2 (concurrency=${CONCURRENCY})...`);

  let cursor = 0;
  let aliveCount = 0;
  let deadCount = 0;
  let thumbRefreshedCount = 0;
  let errorCount = 0;

  const deadVideos = [];
  const deadIdSet = new Set();
  const refreshedById = new Map();

  async function worker() {
    while (cursor < videos.length) {
      const idx = cursor++;
      const video = videos[idx];
      const result = await verifyVideoOnEporner(video);

      if (result.status === 'dead') {
        deadCount++;
        deadIdSet.add(video.id);
        deadVideos.push({
          id: video.id,
          title: video.title,
          canonicalSlug: video.canonicalSlug,
          category: video.category,
          reason: result.reason,
        });
      } else if (result.status === 'alive') {
        aliveCount++;
        if (result.fresh.default_thumb.src !== video.thumbnail) {
          thumbRefreshedCount++;
        }
        refreshedById.set(video.id, result.fresh);
      } else {
        errorCount++;
      }

      const processed = aliveCount + deadCount + errorCount;
      if (processed % 200 === 0 || processed === videos.length) {
        console.log(
          `[Sync] Progress ${processed}/${videos.length} | alive=${aliveCount} | dead=${deadCount} | thumbRefreshed=${thumbRefreshedCount} | errors=${errorCount}`
        );
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const pruneRatio = videos.length > 0 ? deadCount / videos.length : 0;
  if (pruneRatio > MAX_SAFE_PRUNE_RATIO) {
    throw new Error(
      `Safety breaker tripped: ${deadCount}/${videos.length} (${(pruneRatio * 100).toFixed(1)}%) reported dead. Aborting write to prevent accidental wipe.`
    );
  }

  const auditData = {
    auditedAt: runTimestamp,
    mode: dryRun ? 'dry-run' : 'apply',
    catalogBefore: videos.length,
    aliveCount,
    removedCount: deadCount,
    thumbRefreshedCount,
    transientErrorCount: errorCount,
    catalogAfter: videos.length - deadCount,
    removedVideos: deadVideos,
  };

  fs.mkdirSync(path.dirname(AUDIT_PATH), { recursive: true });
  fs.writeFileSync(AUDIT_PATH, JSON.stringify(auditData, null, 2), 'utf8');
  console.log(`[Sync] Saved audit report to docs/eporner_removed_audit.json`);

  if (dryRun) {
    console.log(`[Sync] Dry-run complete. No catalog files modified.`);
    return auditData;
  }

  const nextVideos = [];
  for (const video of videos) {
    if (deadIdSet.has(video.id)) continue;
    const fresh = refreshedById.get(video.id);
    if (!fresh) {
      nextVideos.push(video);
      continue;
    }

    const durationSeconds = Number.parseInt(fresh.length_sec, 10) || video.durationSeconds || 0;
    const nextViews = Number.parseInt(fresh.views, 10) || video.views || 0;
    const nextRating = Number.parseFloat(fresh.rate) || video.rating || 0;
    const thumbChanged = video.thumbnail !== fresh.default_thumb.src;
    const embedChanged = video.embedUrl !== fresh.embed;

    nextVideos.push({
      ...video,
      thumbnail: fresh.default_thumb.src,
      default_thumb: fresh.default_thumb,
      thumbs: Array.isArray(fresh.thumbs) && fresh.thumbs.length > 0 ? fresh.thumbs : video.thumbs,
      embedUrl: fresh.embed,
      embed: fresh.embed,
      sourceUrl: fresh.url || video.sourceUrl,
      durationSeconds,
      duration: isoDuration(durationSeconds) || video.duration,
      length_sec: durationSeconds,
      length_min: fresh.length_min || video.length_min,
      views: nextViews,
      rating: nextRating,
      rate: nextRating,
      availability: 'available',
      sitemapLastmod: thumbChanged || embedChanged ? runTimestamp : video.sitemapLastmod || video.uploadDate,
      syncedAt: runTimestamp,
    });
  }

  const updatedCatalog = {
    ...catalog,
    updatedAt: runTimestamp,
    count: nextVideos.length,
    videos: nextVideos,
  };
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(updatedCatalog, null, 2), 'utf8');
  console.log(
    `[Sync] Catalog updated: ${videos.length} -> ${nextVideos.length} live videos (-${deadCount} dead removed, ${thumbRefreshedCount} thumbnails refreshed).`
  );

  // Clean dead IDs out of discovery-snapshots.json too
  if (deadIdSet.size > 0 && fs.existsSync(SNAPSHOTS_PATH)) {
    try {
      const snapshots = JSON.parse(fs.readFileSync(SNAPSHOTS_PATH, 'utf8'));
      if (snapshots && snapshots.history && typeof snapshots.history === 'object') {
        for (const deadId of deadIdSet) {
          delete snapshots.history[deadId];
        }
        snapshots.updatedAt = runTimestamp;
        fs.writeFileSync(SNAPSHOTS_PATH, JSON.stringify(snapshots, null, 2), 'utf8');
      }
    } catch (err) {
      console.warn(`[Sync] Could not clean discovery-snapshots.json: ${err.message}`);
    }
  }

  if (!skipRebuild && (deadCount > 0 || thumbRefreshedCount > 0)) {
    console.log('[Sync] Rebuilding local sitemaps and RSS feed from cleaned catalog...');
    execFileSync(process.execPath, [path.join(__dirname, 'generate-sitemap.cjs'), '--rebuild-local-sitemaps'], {
      stdio: 'inherit',
    });
  }

  return auditData;
}

if (require.main === module) {
  syncRemoved().catch((err) => {
    console.error('[Sync] Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { syncRemoved };
