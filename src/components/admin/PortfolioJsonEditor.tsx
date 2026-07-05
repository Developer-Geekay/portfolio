"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PortfolioPageData } from "@/lib/shared/portfolio.schema";

export default function PortfolioJsonEditor({ initialData }: { initialData: PortfolioPageData }) {
  const router = useRouter();
  const [json, setJson] = useState(JSON.stringify(initialData, null, 2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setError("");
    setSuccess(false);
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError("Invalid JSON — fix the syntax error before saving.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message ?? "Save failed.");
      }
      const saved = await res.json();
      setJson(JSON.stringify(saved, null, 2));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setJson(JSON.stringify(initialData, null, 2));
    setError("");
    setSuccess(false);
  }

  return (
    <div className="space-y-4">
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        rows={40}
        spellCheck={false}
        className="w-full bg-surface border border-border px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:border-brand/50 transition-colors resize-y leading-relaxed"
      />

      <div className="flex items-center justify-between">
        <div>
          {error && <p className="text-xs text-destructive tracking-widest">{error}</p>}
          {success && <p className="text-xs text-brand tracking-widest">SAVED_SUCCESSFULLY ✓</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="border border-border px-4 py-2 text-xs tracking-widest uppercase text-muted hover:border-brand/40 hover:text-brand transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-brand text-brand-foreground px-6 py-2 text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "SAVING..." : "SAVE_CHANGES"}
          </button>
        </div>
      </div>
    </div>
  );
}
