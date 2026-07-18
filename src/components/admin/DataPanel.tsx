"use client";

import { useCallback, useEffect, useState } from "react";

type Status = {
  collections: { section: string; collection: string; documents: number }[];
  legacyBlobExists: boolean;
  backupExists: boolean;
};

export default function DataPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data");
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setStatus((await res.json()) as Status);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runMigration = useCallback(async () => {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/data", { method: "POST" });
      const data = (await res.json()) as Status & { migrated?: boolean; message?: string };
      if (!res.ok) throw new Error(data.message ?? `Server returned ${res.status}`);
      setStatus(data);
      setMessage(
        data.migrated
          ? "Legacy blob migrated into per-section collections. Old data kept in portfolios_backup."
          : "Nothing to migrate — store already populated or no legacy blob found.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Migration failed.");
    }
    setBusy(false);
  }, []);

  const total = status?.collections.reduce((s, c) => s + c.documents, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* status strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total_Documents", value: status ? String(total) : "…" },
          {
            label: "Legacy_Blob",
            value: status ? (status.legacyBlobExists ? "PRESENT" : "NONE") : "…",
          },
          {
            label: "Backup",
            value: status ? (status.backupExists ? "portfolios_backup" : "NONE") : "…",
          },
        ].map((s) => (
          <div key={s.label} className="border border-border bg-surface/20 p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted mb-2">{s.label}</p>
            <p className="text-sm font-bold text-brand break-all">{s.value}</p>
          </div>
        ))}
      </div>

      {/* migration control */}
      <div className="border border-border bg-surface/20 p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand">Migration</h2>
        <p className="text-xs leading-relaxed text-muted">
          Copies the legacy single-document blob (collection <code className="text-brand">portfolios</code>)
          into the per-section collections. Safe to run repeatedly — it does nothing when the store is
          already populated, and the legacy collection is renamed to{" "}
          <code className="text-brand">portfolios_backup</code>, never dropped.
        </p>
        <button
          type="button"
          onClick={runMigration}
          disabled={busy || !status}
          className="bg-brand text-brand-foreground px-5 py-2.5 text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {busy ? "MIGRATING..." : "RUN_MIGRATION"}
        </button>
        {message && <p className="text-xs text-brand tracking-wide">{message}</p>}
        {error && <p className="text-xs text-destructive tracking-wide">{error}</p>}
      </div>

      {/* collection table */}
      <div className="border border-border bg-surface/20">
        <div className="grid grid-cols-3 gap-4 border-b border-border px-5 py-3 text-[10px] uppercase tracking-widest text-muted">
          <span>Section</span>
          <span>Collection</span>
          <span className="text-right">Documents</span>
        </div>
        {(status?.collections ?? []).map((c) => (
          <div
            key={c.collection}
            className="grid grid-cols-3 gap-4 border-b border-border/50 px-5 py-2.5 text-xs last:border-b-0"
          >
            <span className="text-foreground">{c.section}</span>
            <span className="text-muted font-mono">{c.collection}</span>
            <span className={`text-right font-bold ${c.documents === 0 ? "text-destructive" : "text-brand"}`}>
              {c.documents}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
