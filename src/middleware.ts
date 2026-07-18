import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import { siteOrigin } from "@/lib/site-url";

function redirectTo(path: string, req: NextRequest) {
  return NextResponse.redirect(new URL(path, siteOrigin(req.nextUrl.origin)));
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
