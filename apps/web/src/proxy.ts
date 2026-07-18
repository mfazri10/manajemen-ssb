import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Target API base URL (defaults to http://localhost:3000)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Forward /graphql, /v1/auth, and /api requests to the NestJS backend
  if (
    url.pathname.startsWith('/graphql') ||
    url.pathname.startsWith('/v1/auth') ||
    url.pathname.startsWith('/api')
  ) {
    const targetUrl = new URL(url.pathname + url.search, apiBaseUrl);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Proxy] Rewriting: ${url.pathname} -> ${targetUrl.toString()}`);
    }
    
    return NextResponse.rewrite(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/graphql/:path*',
    '/v1/auth/:path*',
    '/api/:path*',
  ],
};