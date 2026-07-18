import { redirect } from "next/navigation";
import DataPanel from "@/components/admin/DataPanel";
import { dbConnect } from "@/lib/db/client";
import { legacyBlobExists } from "@/lib/server/services/portfolio.migration.server";

export default async function AdminDataPage() {
  // Migration is a one-time task — once no legacy blob remains, this page is
  // done. Send direct visits back to the dashboard.
  await dbConnect();
  if (!(await legacyBlobExists())) redirect("/admin");

  return (
    <div>
      <div className="mb-10">
        <p className="text-brand text-xs tracking-widest uppercase mb-2">// Storage &amp; migration</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">DATA</h1>
      </div>
      <DataPanel />
    </div>
  );
}
