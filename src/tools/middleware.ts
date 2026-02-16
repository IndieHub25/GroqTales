import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Only process admin routes
  if (
    pathname.startsWith('/admin/dashboard') ||
    pathname.startsWith('/admin/settings')
  ) {
    // Check for admin session token in URL first (most reliable)
    const sessionTokenInUrl = searchParams.get('sessionToken');

    // If session token exists in URL, allow access and set cookie for future requests
    if (sessionTokenInUrl) {
      const response = NextResponse.next();

      // Set cookies for future requests to maintain session
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24); // 24-hour expiration

      response.cookies.set({
        name: 'adminSessionActive',
        value: 'true',
        path: '/',
        expires: expirationDate,
      });

      response.cookies.set({
        name: 'adminSessionToken',
        value: sessionTokenInUrl,
        path: '/',
        expires: expirationDate,
      });

      return response;
    }
    // If no token in URL, check for cookie
    const adminSessionCookie = request.cookies.get('adminSessionActive');
    const adminSessionToken = request.cookies.get('adminSessionToken');

    // If no admin session, redirect to login
    if (
      !adminSessionCookie ||
      adminSessionCookie.value !== 'true' ||
      !adminSessionToken
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';

      // Add a return URL query parameter to redirect back after login
      url.searchParams.set('returnUrl', pathname);

      return NextResponse.redirect(url);
    }
    // If admin session is valid, ensure it persists by extending the cookie
    const response = NextResponse.next();

    // Extend cookie expiration time to keep session alive
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24); // 24-hour expiration

    // Refresh both cookies
    response.cookies.set({
      name: 'adminSessionActive',
      value: 'true',
      path: '/',
      expires: expirationDate,
    });

    response.cookies.set({
      name: 'adminSessionToken',
      value: adminSessionToken.value,
      path: '/',
      expires: expirationDate,
    });

    return response;
  }
  // Return for all other paths
  return NextResponse.next();
}
export const config = {
  // Only run middleware on admin routes
  matcher: ['/admin/:path*'],
};
