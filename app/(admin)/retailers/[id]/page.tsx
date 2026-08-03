import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { RetailerDetail } from "@/components/retailers/retailer-detail";

export default async function RetailerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <SiteHeader title="Retailer detail" />
      <main className="flex-1 space-y-6 p-6">
        <Link
          href="/retailers"
          className="text-muted-foreground inline-flex items-center gap-1 text-sm hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to retailers
        </Link>
        <RetailerDetail id={id} />
      </main>
    </>
  );
}
