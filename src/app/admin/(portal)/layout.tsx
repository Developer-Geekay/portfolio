import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import SignOutButton from "@/components/admin/SignOutButton";
import AdminAccent from "@/components/admin/AdminAccent";
import { ThemeToggle } from "@/components/ThemeToggle";
import { dbConnect } from "@/lib/db/client";
import { legacyBlobExists } from "@/lib/server/services/portfolio.migration.server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  await dbConnect();
  const showData = await legacyBlobExists();

  return (
    <div className="min-h-screen bg-[#f7f6f0] dark:bg-[#09090b] text-foreground font-mono transition-colors">
      <AdminAccent />
      <nav className="border-b border-border/80 dark:border-zinc-800/90 bg-surface/90 dark:bg-[#121216]/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-brand glow-sm animate-glow-pulse" />
              <span className="text-xs font-bold tracking-widest text-brand">&gt;_ ADMIN</span>
            </div>
            <AdminNav showData={showData} />
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">{children}</main>
    </div>
  );
}
