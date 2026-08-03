"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EnableDisableButton } from "./enable-disable-button";
import { retailerQueryOptions } from "@/lib/queries/retailers";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RetailerDetail({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useQuery(
    retailerQueryOptions(id),
  );

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error instanceof Error ? error.message : "Retailer not found"}
      </div>
    );
  }

  const fields = [
    { label: "Business Name", value: data.businessName },
    { label: "Business Location", value: data.location ?? "—" },
    { label: "Contact Name", value: data.contactName ?? "—" },
    { label: "Contact Email", value: data.contactEmail ?? "—" },
    { label: "Contact Phone", value: data.contactPhone ?? "—" },
    { label: "Registration Date", value: formatDate(data.registeredAt) },
    {
      label: "Total Receipts",
      value: data.totalReceipts.toLocaleString(),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="font-display text-2xl">
            {data.businessName}
          </CardTitle>
          <div className="mt-2">
            <Badge
              variant={data.accountStatus === "active" ? "success" : "warning"}
            >
              {data.accountStatus}
            </Badge>
          </div>
        </div>
        <EnableDisableButton retailer={data} />
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="space-y-1">
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {field.label}
              </dt>
              <dd className="text-sm font-medium">{field.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
