import { NextRequest, NextResponse } from "next/server";

// Next.js 16: proxy.ts replaces middleware.ts
// https://nextjs.org/docs/app/api-reference/file-conventions/proxy
// This is the network boundary - only redirects/rewrites/headers.
// Real security checks also run in the protected admin dashboard layout.

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public: allow login page and auth API
  if (pathname.startsWith("/admin/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protect /admin routes at edge for better UX (fast redirect)
  // Actual verification with DB happens in app/(admin)/admin/layout.tsx
  if (pathname.startsWith("/admin")) {
    // Better Auth sets cookie named "better-auth.session_token" or "__Secure-better-auth.session_token"
    const sessionToken = request.cookies.get("better-auth.session_token")?.value ||
                         request.cookies.get("__Secure-better-auth.session_token")?.value;

    if (!sessionToken) {
      // No session cookie at all -> redirect to login fast
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackURL", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    // Optionally protect API admin routes at edge too (but session check inside route is mandatory)
    // "/api/admin/:path*"
  ],
};
