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
    <div className="min-h-screen bg-background text-foreground font-mono">
      <AdminAccent />
      <nav className="border-b border-brand/20 bg-background sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-2 bg-brand glow-sm" />
              <span className="text-xs font-bold tracking-widest text-brand">&gt;_ ADMIN</span>
            </div>
            <AdminNav showData={showData} />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">{children}</main>
    </div>
  );
}
