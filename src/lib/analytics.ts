import { dbConnect } from "./db/client";
import { PageView } from "./db/schema";

// Minimal dependency-free user-agent parsing — enough to bucket visits by
// browser and OS without pulling in a UA library.
export function parseUserAgent(ua: string): { browser: string; os: string; isBot: boolean } {
  const s = ua || "";
  const isBot = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|monitor|curl|wget|python-requests/i.test(s);

  let browser = "Unknown";
  if (/edg/i.test(s)) browser = "Edge";
  else if (/opr|opera/i.test(s)) browser = "Opera";
  else if (/samsungbrowser/i.test(s)) browser = "Samsung";
  else if (/firefox|fxios/i.test(s)) browser = "Firefox";
  else if (/chrome|crios/i.test(s)) browser = "Chrome";
  else if (/safari/i.test(s)) browser = "Safari";

  let os = "Unknown";
  if (/windows/i.test(s)) os = "Windows";
  else if (/iphone|ipad|ipod/i.test(s)) os = "iOS";
  else if (/mac os x/i.test(s)) os = "macOS";
  else if (/android/i.test(s)) os = "Android";
  else if (/linux/i.test(s)) os = "Linux";

  return { browser, os, isBot };
}

// First public IP from X-Forwarded-For (nginx sets it), else X-Real-IP.
export function clientIpFrom(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

function utcDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export async function recordView(input: { ip: string; userAgent: string; path: string }): Promise<void> {
  const { browser, os, isBot } = parseUserAgent(input.userAgent);
  if (isBot) return; // don't count crawlers as visitors
  await dbConnect();
  await PageView.create({
    day: utcDay(),
    ip: input.ip,
    browser,
    os,
    path: input.path.slice(0, 512),
    at: new Date(),
  });
}

export type AnalyticsSummary = {
  totals: { views: number; visitors: number; days: number };
  daily: { day: string; views: number; visitors: number }[];
  browsers: { name: string; count: number }[];
  os: { name: string; count: number }[];
  topPages: { path: string; views: number }[];
  recentVisitors: { ip: string; browser: string; os: string; at: string }[];
};

// Aggregates the last `days` days (default 30) for the admin dashboard.
export async function getAnalytics(days = 30): Promise<AnalyticsSummary> {
  await dbConnect();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const match = { at: { $gte: since } };

  const [daily, browsers, os, topPages, totalsAgg, recent] = await Promise.all([
    PageView.aggregate([
      { $match: match },
      { $group: { _id: "$day", views: { $sum: 1 }, visitors: { $addToSet: "$ip" } } },
      { $project: { day: "$_id", views: 1, visitors: { $size: "$visitors" }, _id: 0 } },
      { $sort: { day: 1 } },
    ]),
    PageView.aggregate([
      { $match: match },
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]),
    PageView.aggregate([
      { $match: match },
      { $group: { _id: "$os", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]),
    PageView.aggregate([
      { $match: match },
      { $group: { _id: "$path", views: { $sum: 1 } } },
      { $project: { path: "$_id", views: 1, _id: 0 } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]),
    PageView.aggregate([
      { $match: match },
      { $group: { _id: null, views: { $sum: 1 }, visitors: { $addToSet: "$ip" } } },
      { $project: { views: 1, visitors: { $size: "$visitors" }, _id: 0 } },
    ]),
    PageView.find(match).sort({ at: -1 }).limit(20).lean(),
  ]);

  return {
    totals: {
      views: totalsAgg[0]?.views ?? 0,
      visitors: totalsAgg[0]?.visitors ?? 0,
      days,
    },
    daily,
    browsers,
    os,
    topPages,
    recentVisitors: recent.map((r) => ({
      ip: r.ip,
      browser: r.browser,
      os: r.os,
      at: new Date(r.at).toISOString(),
    })),
  };
}
