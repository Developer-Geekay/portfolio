"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminAccent from "@/components/admin/AdminAccent";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid password.");
    } else {
      router.push("/admin/portfolio");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center px-4">
      <AdminAccent />
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-3 rounded-full bg-brand glow-sm animate-glow-pulse" />
          <span className="text-brand text-sm font-bold tracking-widest">&gt;_ ADMIN_ACCESS</span>
        </div>

        <div className="border border-border/90 dark:border-zinc-800 bg-surface/90 dark:bg-[#131317] rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-surface/80 dark:bg-[#18181d] px-4 py-2.5 border-b border-border/80 dark:border-zinc-800 flex items-center gap-2">
            <div className="size-2 rounded-full bg-border" />
            <div className="size-2 rounded-full bg-border" />
            <div className="size-2 rounded-full bg-border" />
            <span className="text-[10px] text-muted-foreground dark:text-zinc-400 ml-2 uppercase tracking-widest font-semibold">
              auth — credential_check
            </span>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground dark:text-zinc-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-background dark:bg-[#0c0c0e] border border-border/90 dark:border-zinc-700 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-all shadow-inner"
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-xs text-destructive tracking-widest font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand text-brand-foreground px-4 py-2.5 text-xs font-bold tracking-widest uppercase hover:brightness-110 active:scale-95 shadow-glow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "AUTHENTICATING..." : "AUTHENTICATE →"}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-muted/50 tracking-widest mt-6 uppercase">
          Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
