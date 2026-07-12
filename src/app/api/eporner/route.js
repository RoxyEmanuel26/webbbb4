import { NextResponse } from 'next/server';
import { epornerServerApi } from '@/lib/eporner';

export const runtime = 'edge';

export async function GET(request) {


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
