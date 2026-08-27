"use client";

import Link from "next/link";
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
import { cn } from "@/lib/utils";

const cards: Array<{
  key: keyof AdminMetrics;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
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
  {
    key: "pendingReturns",
    label: "Pending Returns",
    icon: Clock3,
    href: "/returns?tab=pending",
  },
  {
    key: "approvedReturns",
    label: "Approved Returns",
    icon: ShoppingBag,
    href: "/returns?tab=approved",
  },
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
        const content = (
          <>
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
          </>
        );

        if (card.href) {
          return (
            <Link
              key={card.key}
              href={card.href}
              className={cn(
                "rounded-xl transition-colors outline-none focus-visible:ring-ring focus-visible:ring-[3px]",
              )}
            >
              <Card className="gap-3 py-5 hover:bg-muted/40">{content}</Card>
            </Link>
          );
        }

        return (
          <Card key={card.key} className="gap-3 py-5">
            {content}
          </Card>
        );
      })}
    </div>
  );
}
