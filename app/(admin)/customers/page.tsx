import { SiteHeader } from "@/components/layout/site-header";
import { CustomersTable } from "@/components/customers/customers-table";

export default function CustomersPage() {
  return (
    <>
      <SiteHeader title="Customer lookup" />
      <main className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Customers
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Search by name, phone, or email. Matching contacts across retailers
            are grouped into one person.
          </p>
        </div>
        <CustomersTable />
      </main>
    </>
  );
}
