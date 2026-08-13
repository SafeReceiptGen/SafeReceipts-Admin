import { SiteHeader } from "@/components/layout/site-header";
import { ReceiptDetail } from "@/components/receipts/receipt-detail";

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <SiteHeader title="Receipt detail" />
      <main className="flex-1 space-y-6 p-6">
        <ReceiptDetail id={id} />
      </main>
    </>
  );
}
