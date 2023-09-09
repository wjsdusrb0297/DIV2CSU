import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  return handleAuth(request);
}

async function handleAuth(request: NextRequest) {
  if (request.nextUrl.pathname === '/auth/logout') {
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/login`, {
      headers: {
        'Set-Cookie': 'auth.access_token=deleted; Path=/; Max-Age=-1',
      },
    });
  }
  if (
    ['/_next', '/favicon.ico', '/auth/login'].some((url) =>
      request.nextUrl.pathname.startsWith(url),
    )
  ) {
    return NextResponse.next();
  }
  const accessToken = request.cookies.get('auth.access_token')?.value;
  let user = null;
  if (accessToken) {
    try {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_SECRET_KEY!),
        { algorithms: ['HS512'] },
      );
      user = payload;
    } catch (e) {}
  }

  if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/login`);
  }
  if (
    (user?.verified !== true || user?.deleted === true) &&
    !['/auth/needVerification', '/auth/rejected', '/auth/deleted'].some((url) =>
      request.nextUrl.pathname.startsWith(url),
    )
  ) {
    if (user?.verified === null) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth/needVerification`,
      );
    }
    if (user?.verified === false) {
      return NextResponse.redirect(`${request.nextUrl.origin}/auth/rejected`);
    }
    if (user?.deleted) {
      return NextResponse.redirect(`${request.nextUrl.origin}/auth/deleted`);
    }
    return;
  }
  return NextResponse.next();
}
