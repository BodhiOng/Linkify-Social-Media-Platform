import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Get the pathname of the request (e.g. /, /protected)
    const path = request.nextUrl.pathname;

    // Public paths that don't require authentication
    const isPublicPath = path === '/login' || path === '/register';

    // Check if user is authenticated
    const token = request.cookies.get('token')?.value;

    // If the path requires authentication and user is not authenticated,
    // redirect to login
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If user is authenticated and trying to access login/register,
    // redirect to feed
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/feed', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};