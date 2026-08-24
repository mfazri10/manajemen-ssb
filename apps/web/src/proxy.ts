import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rute yang hanya boleh diakses oleh user yang sudah login
const PROTECTED_PREFIXES = ['/admin', '/portal', '/affiliate/dashboard'];

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const ref = url.searchParams.get('ref');

  // Target API base URL (defaults to http://localhost:3000)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // --- Proteksi rute berbasis session (Better Auth) ---
  // Pengecekan di level proxy (edge) sehingga halaman admin/portal tidak bisa
  // diakses hanya dengan mengetik URL, bahkan sebelum JavaScript client berjalan.
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => url.pathname === p || url.pathname.startsWith(`${p}/`),
  );
  if (isProtected) {
    // Cookie session Better Auth berformat "<prefix>.session_token"
    const hasSession = request.cookies
      .getAll()
      .some((c) => c.name.endsWith('.session_token'));
    if (!hasSession) {
      const loginUrl = new URL('/auth/login', url.origin);
      loginUrl.searchParams.set('redirect', url.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  let response = NextResponse.next();

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

    response = NextResponse.rewrite(targetUrl);
  }

  // Tracking referral code via cookie (30 days persistence)
  if (ref) {
    response.cookies.set('affiliate_ref', ref, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      httpOnly: false, // Accessible by client JS if needed
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files & images
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};