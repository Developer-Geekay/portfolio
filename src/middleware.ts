import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";

// Behind a reverse proxy that doesn't forward the original Host header,
// req.url carries the internal host:port (e.g. localhost:31000) and an
// absolute redirect built from it would send the browser there. Prefer an
// explicit SITE_URL, then the standard forwarded headers, then req.url.
function redirectTo(path: string, req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
  const base =
    process.env.SITE_URL ??
    (forwardedHost ? `${forwardedProto}://${forwardedHost}` : req.url);
  return Response.redirect(new URL(path, base));
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
