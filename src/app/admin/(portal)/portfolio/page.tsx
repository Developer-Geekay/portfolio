import PortfolioFormEditor from "@/components/admin/PortfolioFormEditor";

export default function AdminPortfolioPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-brand text-xs tracking-widest uppercase mb-2">// Data management</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">PORTFOLIO_DATA</h1>
      </div>
      <PortfolioFormEditor />
    </div>
  );
}
