import { NextResponse } from 'next/server';
import { epornerServerApi } from '@/lib/eporner';

export const runtime = 'edge';

export async function GET(request) {
  // Security Layer: Protect against Traffic Amplification & Scraping
  const isInternal = request.headers.get('x-internal-request') === 'nicevx';
  const referer = request.headers.get('referer') || '';
  const isTrustedReferer = referer.includes('nicevx.com') || referer.includes('localhost') || referer.includes('127.0.0.1');

  if (!isInternal && !isTrustedReferer) {
    return NextResponse.json({ error: 'Forbidden: Unauthorized API access' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'search';
  
  const params = {};
  for (const [key, value] of searchParams.entries()) {
    if (key !== 'action') {
      params[key] = value;
    }
  }
  
  try {
    let data;
    if (action === 'id') {
      data = await epornerServerApi.getVideoDetails(params.id, params.thumbsize);
    } else {
      data = await epornerServerApi.searchVideos(params);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
