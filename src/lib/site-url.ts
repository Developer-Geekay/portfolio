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

// Resolves a post-auth redirect target to a URL guaranteed to be on the
// trusted origin (open-redirect / phishing protection). Only the path portion
// of the target is ever used and it is always re-anchored to the trusted
// origin, so absolute URLs (including the leaked proxy host), protocol-relative
// ("//evil.com") and backslash ("/\evil.com") tricks can never change the host.
export function resolveInternalRedirect(target: string, devFallback?: string): string {
  const origin = siteOrigin(devFallback);
  try {
    const parsed = new URL(target, origin);
    return new URL(`${parsed.pathname}${parsed.search}${parsed.hash}`, origin).toString();
  } catch {
    // malformed target — fall through to safe default
    return origin;
  }
}
