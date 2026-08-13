import { SiteHeader } from "@/components/layout/site-header";
import { ServiceStatusCards } from "@/components/health/service-status-cards";

export default function PlatformHealthPage() {
  return (
    <>
      <SiteHeader title="Platform health" />
      <main className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Platform health
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor core platform services so you know when systems are
            unavailable or degraded.
          </p>
        </div>
        <ServiceStatusCards />
      </main>
    </>
  );
}
