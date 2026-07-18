// Single source of truth for the site's public origin.
//
// Behind the HostPanel nginx proxy, the Host header reaching Next is the
// internal upstream (localhost:31000), so anything that derives a URL from the
// request — middleware redirects, NextAuth's base URL — would leak or redirect
// to localhost. Never trust request headers for the host; use this instead.
//
// Order: SITE_URL env override → canonical domain in production → request
// origin in local dev (passed by the caller).
const CANONICAL_URL = "https://gokulakannan.dev";

export function siteOrigin(devFallback?: string): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.NODE_ENV === "production") return CANONICAL_URL;
  return devFallback ?? CANONICAL_URL;
}

// Resolves a post-auth redirect target against the trusted origin, rejecting
// any off-site URL (open-redirect / phishing protection). Accepts a relative
// path ("/admin") or an absolute URL that must match the trusted origin.
export function resolveInternalRedirect(target: string, devFallback?: string): string {
  const origin = siteOrigin(devFallback);
  if (target.startsWith("/")) return new URL(target, origin).toString();
  try {
    const url = new URL(target);
    if (url.origin === new URL(origin).origin) return url.toString();
  } catch {
    // fall through to safe default
  }
  return origin;
}
