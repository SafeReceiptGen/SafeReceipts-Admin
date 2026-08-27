import { SiteHeader } from "@/components/layout/site-header";
import { ReturnsTable } from "@/components/returns/returns-table";

export default function ReturnsPage() {
  return (
    <>
      <SiteHeader title="Return management" />
      <main className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Returns
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Review return requests across retailers to support customers and
            merchants. Approve and reject remain with the retailer portal.
          </p>
        </div>
        <ReturnsTable />
      </main>
    </>
  );
}
