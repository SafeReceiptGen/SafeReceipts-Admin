import { SiteHeader } from "@/components/layout/site-header";
import { ReceiptsTable } from "@/components/receipts/receipts-table";

export default function ReceiptsPage() {
  return (
    <>
      <SiteHeader title="Receipt search" />
      <main className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Receipts
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Search by receipt ID, receipt number, customer, or retailer to verify
            purchases and assist customers.
          </p>
        </div>
        <ReceiptsTable />
      </main>
    </>
  );
}
