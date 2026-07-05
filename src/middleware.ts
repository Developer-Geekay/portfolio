import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPath = req.nextUrl.pathname === "/admin/login";

  if (!isLoggedIn && !isLoginPath) {
    return Response.redirect(new URL("/admin/login", req.url));
  }

  if (isLoggedIn && isLoginPath) {
    return Response.redirect(new URL("/admin", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
