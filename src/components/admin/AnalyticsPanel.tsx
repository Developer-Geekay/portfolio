import type { AnalyticsSummary } from "@/lib/analytics";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border bg-surface/20 p-5">
      <p className="text-[10px] uppercase tracking-widest text-muted mb-2">{label}</p>
      <p className="text-2xl font-display font-bold text-brand tabular-nums">{value}</p>
    </div>
  );
}

function Bars({ title, rows }: { title: string; rows: { name: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="border border-border bg-surface/20 p-5">
      <h2 className="text-sm font-bold uppercase tracking-widest text-brand mb-4">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-xs text-muted">No data yet.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.name} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-foreground truncate">{r.name}</span>
              <div className="h-2 flex-1 bg-surface/60 overflow-hidden rounded-sm">
                <div className="h-full bg-brand rounded-sm" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-bold text-muted tabular-nums">{r.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPanel({ data }: { data: AnalyticsSummary }) {
  const maxDaily = Math.max(1, ...data.daily.map((d) => d.views));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={`Views_(${data.totals.days}d)`} value={data.totals.views} />
        <Stat label={`Unique_Visitors_(${data.totals.days}d)`} value={data.totals.visitors} />
        <Stat label="Active_Days" value={data.daily.length} />
      </div>

      {/* daily views bar chart */}
      <div className="border border-border bg-surface/20 p-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand mb-4">
          Daily_Visits — views &amp; unique IPs
        </h2>
        {data.daily.length === 0 ? (
          <p className="text-xs text-muted">No visits recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {data.daily.map((d) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-[11px] text-muted tabular-nums">{d.day}</span>
                <div className="h-4 flex-1 bg-surface/60 overflow-hidden rounded-sm">
                  <div
                    className="h-full bg-brand/80 rounded-sm"
                    style={{ width: `${(d.views / maxDaily) * 100}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right text-[11px] text-foreground tabular-nums">
                  {d.views} views · {d.visitors} ip
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bars title="Browsers" rows={data.browsers} />
        <Bars title="Operating_Systems" rows={data.os} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* top pages */}
        <div className="border border-border bg-surface/20 p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand mb-4">Top_Pages</h2>
          {data.topPages.length === 0 ? (
            <p className="text-xs text-muted">No data yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.topPages.map((p) => (
                <li key={p.path} className="flex justify-between gap-3 text-xs">
                  <span className="text-foreground truncate font-mono">{p.path}</span>
                  <span className="text-muted font-bold tabular-nums">{p.views}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* recent visitors */}
        <div className="border border-border bg-surface/20 p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand mb-4">Recent_Visitors</h2>
          {data.recentVisitors.length === 0 ? (
            <p className="text-xs text-muted">No visits recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.recentVisitors.map((v, i) => (
                <li key={i} className="flex justify-between gap-3 text-[11px]">
                  <span className="text-foreground font-mono truncate">{v.ip}</span>
                  <span className="text-muted shrink-0">
                    {v.browser}/{v.os} · {v.at.replace("T", " ").slice(5, 16)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
