import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

// The redirect host comes only from trusted sources — an env override, else
// the canonical domain in production, else the request origin in dev. Never
// from request headers, so a forged X-Forwarded-Host cannot retarget the
// redirect (open-redirect / phishing). The production default means no manual
// server config is required; set SITE_URL to override (e.g. a staging host).
const CANONICAL_URL = "https://gokulakannan.dev";

function redirectTo(path: string, req: NextRequest) {
  const base =
    process.env.SITE_URL ??
    (process.env.NODE_ENV === "production" ? CANONICAL_URL : req.nextUrl.origin);
  return NextResponse.redirect(new URL(path, base));
}

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isLoginPath = req.nextUrl.pathname === "/admin/login";

  if (!isLoggedIn && !isLoginPath) {
    return redirectTo("/admin/login", req);
  }

  if (isLoggedIn && isLoginPath) {
    return redirectTo("/admin", req);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
