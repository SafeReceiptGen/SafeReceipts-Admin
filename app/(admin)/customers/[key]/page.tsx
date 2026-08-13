import { SiteHeader } from "@/components/layout/site-header";
import { CustomerDetail } from "@/components/customers/customer-detail";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const decodedKey = decodeURIComponent(key);

  return (
    <>
      <SiteHeader title="Customer profile" />
      <main className="flex-1 space-y-6 p-6">
        <CustomerDetail encodedKey={decodedKey} />
      </main>
    </>
  );
}
