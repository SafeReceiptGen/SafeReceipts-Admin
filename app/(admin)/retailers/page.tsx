import { SiteHeader } from "@/components/layout/site-header";
import { RetailersTable } from "@/components/retailers/retailers-table";

export default function RetailersPage() {
  return (
    <>
      <SiteHeader title="Retailer management" />
      <main className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Retailers
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Search and inspect retailer accounts for support and troubleshooting.
          </p>
        </div>
        <RetailersTable />
      </main>
    </>
  );
}
