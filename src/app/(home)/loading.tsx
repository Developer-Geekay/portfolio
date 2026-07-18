// Streamed instantly while the server fetches portfolio data from MongoDB —
// the page content replaces this as soon as getPortfolio() resolves.
// Static text only: the real boot sequence (PageLoader) plays after data
// arrives, so this is the pre-data phase of the same terminal aesthetic.
export default function HomeLoading() {
  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center font-mono">
      <div className="w-full max-w-md px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-3 rounded-full bg-brand animate-pulse" />
          <span className="text-brand text-sm font-bold tracking-widest">&gt;_</span>
        </div>
        <div className="rounded-lg border border-border bg-surface/90 overflow-hidden mb-6">
          <div className="bg-surface px-4 py-2 border-b border-border flex items-center gap-2">
            <div className="size-2 rounded-full bg-border" />
            <div className="size-2 rounded-full bg-border" />
            <div className="size-2 rounded-full bg-border" />
            <span className="text-[10px] text-muted ml-2 uppercase tracking-widest">
              bash — data_fetch
            </span>
          </div>
          <div className="p-5 min-h-[140px] space-y-2">
            <p className="text-xs leading-relaxed text-foreground">$ CONNECT --datasource=mongodb</p>
            <p className="text-xs leading-relaxed text-muted">
              &gt; Fetching portfolio collections...
              <span className="text-brand cursor-blink ml-0.5">_</span>
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-0.5 bg-surface/50 rounded-full overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-brand animate-pulse" />
          </div>
          <div className="flex justify-between text-[10px] tracking-widest text-muted">
            <span>AWAITING_DATA_SOURCE</span>
            <span className="text-brand">MONGODB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
