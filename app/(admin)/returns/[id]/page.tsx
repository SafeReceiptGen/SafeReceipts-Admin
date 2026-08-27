import { SiteHeader } from "@/components/layout/site-header";
import { ReturnDetail } from "@/components/returns/return-detail";

export default async function ReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <SiteHeader title="Return detail" />
      <main className="flex-1 space-y-6 p-6">
        <ReturnDetail id={id} />
      </main>
    </>
  );
}
