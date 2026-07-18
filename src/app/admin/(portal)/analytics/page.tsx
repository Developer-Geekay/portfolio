import AnalyticsPanel from "@/components/admin/AnalyticsPanel";
import { getAnalytics } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const data = await getAnalytics(30);

  return (
    <div>
      <div className="mb-10">
        <p className="text-brand text-xs tracking-widest uppercase mb-2">// Visitor analytics · last 30 days</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">ANALYTICS</h1>
      </div>
      <AnalyticsPanel data={data} />
    </div>
  );
}
