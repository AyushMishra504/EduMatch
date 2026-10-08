import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next 16 middleware (formerly `middleware.ts`).
 *
 * This is a *cheap first pass* only. With the Auth.js v5 database session
 * strategy the session cookie is an opaque token the Edge runtime cannot
 * validate without Prisma, and running `auth()` here costs a session lookup
 * on every matched request on top of the one the page already does. So we
 * check cookie presence and let the authoritative page gates
 * (`requireEducatorProfile` / `requireEducatorWithUser` / the dashboard's own
 * `auth()` + role check) do the real validation.
 *
 * Chunked cookies (`authjs.session-token.0`, …) and the `__Secure-` production
 * prefix are both matched, so a legitimate session is never bounced.
 */
const SESSION_COOKIE_BASES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) =>
    SESSION_COOKIE_BASES.some(
      (base) =>
        cookie.name === base || cookie.name.startsWith(`${base}.`),
    ),
  );
}

export default function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const isProtected =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/onboarding") ||
    nextUrl.pathname.startsWith("/profile");

  if (isProtected && !hasSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/profile/:path*"],
};
