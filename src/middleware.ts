import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/auth/logout') {
    return NextResponse.redirect(new URL('/auth/login', request.url), {
      headers: {
        'Set-Cookie': 'auth.access_token=deleted; Path=/; Max-Age=-1',
      },
    });
  }
}
