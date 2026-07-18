import { NextRequest, NextResponse } from "next/server";
import { recordView, clientIpFrom } from "@/lib/analytics";

// Public endpoint hit by the client beacon on each page view. Same-origin
// only (blocks casual cross-site spamming), and admin paths are ignored.
export async function POST(req: NextRequest) {
  if (req.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let path = "/";
  try {
    const body = (await req.json()) as { path?: string };
    if (typeof body.path === "string" && body.path.startsWith("/")) path = body.path;
  } catch {
    // no/invalid body — default to "/"
  }

  if (path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true });
  }

  try {
    await recordView({
      ip: clientIpFrom(req.headers),
      userAgent: req.headers.get("user-agent") ?? "",
      path,
    });
  } catch {
    // analytics must never break the page — swallow errors
  }
  return NextResponse.json({ ok: true });
}
