import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  
  // Periksa apakah ada parameter query pelacakan
  let hasTracking = false;
  const paramsToDelete = [];
  
  for (const [key, value] of url.searchParams.entries()) {
    if (key.startsWith('utm_') || key === 'fbclid' || key === 'gclid' || key === 'ref') {
      hasTracking = true;
      paramsToDelete.push(key);
    }
  }

  // Jika ada parameter pelacakan, hapus dan alihkan ke URL bersih
  if (hasTracking) {
    paramsToDelete.forEach(key => url.searchParams.delete(key));
    
    // Redirect 308 (Permanent Redirect) ke URL yang bersih
    return NextResponse.redirect(url, 308);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
