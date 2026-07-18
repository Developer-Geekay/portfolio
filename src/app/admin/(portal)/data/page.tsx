import DataPanel from "@/components/admin/DataPanel";

export default function AdminDataPage() {
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
