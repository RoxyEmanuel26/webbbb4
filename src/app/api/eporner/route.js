import { NextResponse } from 'next/server';
import { epornerServerApi } from '@/lib/eporner';

export const runtime = 'edge';
const ALLOWED_PARAMS = new Set([
  'id', 'query', 'per_page', 'page', 'thumbsize', 'order', 'gay', 'lq', 'format',
]);
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60',
  'CDN-Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
};

function shouldSamplePerformance() {
  const configured = Number.parseFloat(process.env.PERF_SAMPLE_RATE || '0.005');
  const rate = Number.isFinite(configured) ? Math.min(Math.max(configured, 0), 1) : 0.005;
  return Math.random() < rate;
}

export async function GET(request) {
  const startedAt = performance.now();
  const sampled = shouldSamplePerformance();
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'search';
  
  const params = {};
  for (const [key, value] of searchParams.entries()) {
    if (key !== 'action' && ALLOWED_PARAMS.has(key)) {
      params[key] = value;
    }
  }

  if (action === 'id' && !/^[A-Za-z0-9]{8,12}$/.test(params.id || '')) {
    return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
  }
  if (params.query) params.query = params.query.slice(0, 100);
  if (params.page) params.page = String(Math.max(1, Math.min(Number.parseInt(params.page, 10) || 1, 1000)));
  if (params.per_page) params.per_page = String(Math.max(1, Math.min(Number.parseInt(params.per_page, 10) || 20, 50)));
  
  try {
    let data;
    if (action === 'id') {
      data = await epornerServerApi.getVideoDetails(params.id, params.thumbsize);
    } else {
      data = await epornerServerApi.searchVideos(params);
    }
    
    const response = NextResponse.json(data, { headers: CACHE_HEADERS });
    if (sampled) {
      console.log(`[PERF] route=/api/eporner action=${action === 'id' ? 'id' : 'search'} total=${(performance.now() - startedAt).toFixed(1)}ms`);
    }
    return response;
  } catch (error) {
    if (sampled) {
      console.log(`[PERF] route=/api/eporner action=${action === 'id' ? 'id' : 'search'} status=500 total=${(performance.now() - startedAt).toFixed(1)}ms`);
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
