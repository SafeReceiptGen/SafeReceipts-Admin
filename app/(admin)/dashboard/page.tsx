import { SiteHeader } from "@/components/layout/site-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";

export default function DashboardPage() {
  return (
    <>
      <SiteHeader title="Dashboard overview" />
      <main className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Platform activity
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            High-level view of retailers, receipts, and returns across the
            platform.
          </p>
        </div>
        <KpiCards />
      </main>
    </>
  );
}
