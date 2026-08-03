"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  FileText,
  ShoppingBag,
  Users,
  Clock3,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { metricsQueryOptions } from "@/lib/queries/metrics";
import type { AdminMetrics } from "@/types/admin";

const cards: Array<{
  key: keyof AdminMetrics;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "totalRetailers", label: "Total Retailers", icon: Building2 },
  { key: "activeRetailers", label: "Active Retailers", icon: CheckCircle2 },
  { key: "totalCustomers", label: "Total Customers", icon: Users },
  { key: "totalReceipts", label: "Total Receipts", icon: FileText },
  {
    key: "receiptsIssuedToday",
    label: "Receipts Issued Today",
    icon: CalendarDays,
  },
  { key: "pendingReturns", label: "Pending Returns", icon: Clock3 },
  { key: "approvedReturns", label: "Approved Returns", icon: ShoppingBag },
];

export function KpiCards() {
  const { data, isLoading, isError, error } = useQuery(metricsQueryOptions);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Skeleton key={card.key} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load metrics:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key} className="gap-3 py-5">
            <CardHeader className="flex flex-row items-center justify-between px-5">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {card.label}
              </CardTitle>
              <Icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent className="px-5">
              <p className="font-display text-3xl font-semibold tracking-tight">
                {(data?.[card.key] ?? 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
