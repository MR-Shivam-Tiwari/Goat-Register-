import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes
  const isProtectedRoute = pathname.startsWith('/catalog') || pathname.startsWith('/farms') || pathname.startsWith('/profile');
  
  // Check for auth cookie
  const token = request.cookies.get('uid_token');
  
  if (isProtectedRoute && !token) {
    // Redirect to login if trying to access protected route without token
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Optional: add callback url
    // url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Config to limit middleware to specific paths
export const config = {
  matcher: [
    '/catalog/:path*',
    '/farms/:path*',
    '/profile/:path*',
  ],
};
