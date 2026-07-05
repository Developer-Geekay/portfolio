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
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center px-4">
      <AdminAccent />
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-3 rounded-full bg-brand glow-sm" />
          <span className="text-brand text-sm font-bold tracking-widest">&gt;_ ADMIN_ACCESS</span>
        </div>

        <div className="border border-brand/20 bg-surface/20 rounded-lg overflow-hidden">
          <div className="bg-surface px-4 py-2 border-b border-border flex items-center gap-2">
            <div className="size-2 rounded-full bg-border" />
            <div className="size-2 rounded-full bg-border" />
            <div className="size-2 rounded-full bg-border" />
            <span className="text-[10px] text-muted ml-2 uppercase tracking-widest">auth — credential_check</span>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand/50 transition-colors"
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-xs text-destructive tracking-widest">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-brand-foreground px-4 py-2.5 text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
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
