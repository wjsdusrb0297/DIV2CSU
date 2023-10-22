import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/auth/logout') {
    return NextResponse.redirect(new URL('/auth/login', request.url), {
      headers: {
        'Set-Cookie': 'auth.access_token=deleted; Path=/; Max-Age=-1',
      },
    });
  }
  if (
    !request.cookies.get('auth.access_token') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
};
