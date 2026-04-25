import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware for route protection
 *
 * This middleware runs on every request and:
 * 1. Protects routes that require authentication (redirects to /login)
 * 2. Prevents authenticated users from accessing auth pages (redirects to /)
 * 3. Preserves the original URL in a redirect query param for post-login redirect
 *
 * Protected routes: /account/*, /thank-you, /update-email, /update-password
 * Auth routes: /login, /signup
 *
 * The middleware checks for a "token" cookie set by config/storage.ts
 */

// Define protected routes that require authentication
const protectedRoutes = [
  "/account",
  "/thank-you",
  "/update-email",
  "/update-password"
];

// Define auth routes that should redirect to home if already logged in
const authRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  const tokenCookie = request.cookies.get("storefront_token")?.value;

  // Parse and validate the token
  let isAuthenticated = false;
  if (tokenCookie) {
    try {
      const tokenData = JSON.parse(decodeURIComponent(tokenCookie));

      // Check if token has access_token
      if (tokenData.access_token) {
        // If we have created_at and expires_in, check expiration
        if (tokenData.created_at && tokenData.expires_in) {
          const expiresAt = tokenData.created_at + tokenData.expires_in;
          const now = Math.floor(Date.now() / 1000);
          isAuthenticated = now < expiresAt;
        } else {
          // Token exists but missing timestamp info - assume valid
          // (this handles legacy tokens or different token formats)
          isAuthenticated = true;
        }
      }
    } catch (e) {
      // Invalid token format, treat as not authenticated
      isAuthenticated = false;
      console.error("[Middleware] Token parse error:", e);
    }
  }

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Add the original URL as a redirect parameter
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access auth routes, redirect to home
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure which routes should run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)"
  ]
};
