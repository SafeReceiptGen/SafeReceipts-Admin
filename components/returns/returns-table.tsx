"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { returnsQueryOptions } from "@/lib/queries/returns";
import { retailersQueryOptions } from "@/lib/queries/retailers";
import type { AdminReturnTab } from "@/types/admin";

const PAGE_SIZE = 10;

const TABS: Array<{ value: AdminReturnTab; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", tab: "pending" as const },
  {
    value: "pickup_scheduled",
    label: "Pickup scheduled",
    tab: "pending" as const,
  },
  { value: "approved", label: "Approved", tab: "approved" as const },
  { value: "rejected", label: "Rejected", tab: "rejected" as const },
  { value: "cancelled", label: "Cancelled", tab: "rejected" as const },
  { value: "collected", label: "Collected", tab: "completed" as const },
  { value: "in_transit", label: "In transit", tab: "completed" as const },
  { value: "with_retailer", label: "With retailer", tab: "completed" as const },
  { value: "refunded", label: "Refunded", tab: "completed" as const },
  { value: "completed", label: "Completed", tab: "completed" as const },
];

const REASON_LABELS: Record<string, string> = {
  defective: "Defective",
  wrong_item: "Wrong item",
  changed_mind: "Changed mind",
  damaged_in_delivery: "Damaged in delivery",
  other: "Other",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function returnStatusBadgeVariant(
  status: string,
): "success" | "warning" | "destructive" | "secondary" {
  if (status === "approved" || status === "refunded" || status === "completed") {
    return "success";
  }
  if (status === "rejected" || status === "cancelled") return "destructive";
  if (status === "pending" || status === "pickup_scheduled") return "warning";
  return "secondary";
}

function reasonLabel(code: string | null, fallback: string | null) {
  if (code && REASON_LABELS[code]) return REASON_LABELS[code];
  return fallback || code || "—";
}

export function ReturnsTable() {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("pending"),
  );
  const [q, setQ] = useQueryState("q", { defaultValue: "" });
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [retailerId, setRetailerId] = useQueryState(
    "retailerId",
    parseAsString.withDefault(""),
  );
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(""),
  );
  const [from, setFrom] = useQueryState("from", parseAsString.withDefault(""));
  const [to, setTo] = useQueryState("to", parseAsString.withDefault(""));

  const debouncedQ = useDebouncedValue(q, 300);
  const activeTab = (TABS.some((t) => t.value === tab)
    ? tab
    : "pending") as AdminReturnTab;

  const retailersQuery = useQuery(
    retailersQueryOptions({ page: 1, limit: 100 }),
  );

  const { data, isLoading, isError, error } = useQuery(
    returnsQueryOptions({
      q: debouncedQ || undefined,
      tab: activeTab,
      status: status || undefined,
      retailerId: retailerId || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: PAGE_SIZE,
    }),
  );

  const totalCount = data?.totalCount ?? 0;
  const tabCounts = data?.tabCounts;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  async function resetPage() {
    if (page !== 1) await setPage(1);
  }

  async function handleTabChange(value: string) {
    await setTab(value);
    await setStatus(null);
    await resetPage();
  }

  async function handleSearchChange(value: string) {
    await setQ(value || null);
    await resetPage();
  }

  async function handleStatusChange(value: string) {
    if (value === "all") {
      await setStatus(null);
    } else {
      const match = STATUS_OPTIONS.find((o) => o.value === value);
      if (match && match.tab !== activeTab) {
        await setTab(match.tab);
      }
      await setStatus(value);
    }
    await resetPage();
  }

  async function handleRetailerChange(value: string) {
    await setRetailerId(value === "all" ? null : value);
    await resetPage();
  }

  async function handleFromChange(value: string) {
    await setFrom(value || null);
    await resetPage();
  }

  async function handleToChange(value: string) {
    await setTo(value || null);
    await resetPage();
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              {tabCounts ? (
                <span className="text-muted-foreground ml-1.5 text-xs">
                  ({tabCounts[t.value]})
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[220px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => void handleSearchChange(e.target.value)}
            placeholder="Search return #, receipt, customer, retailer…"
            className="pl-9"
          />
        </div>

        <Select value={status || "all"} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={retailerId || "all"}
          onValueChange={handleRetailerChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Retailer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All retailers</SelectItem>
            {(retailersQuery.data?.items ?? []).map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.businessName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={from}
          onChange={(e) => void handleFromChange(e.target.value)}
          className="w-[160px]"
          aria-label="From date"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => void handleToChange(e.target.value)}
          className="w-[160px]"
          aria-label="To date"
        />
      </div>

      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load returns"}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return #</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Retailer</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}

              {!isLoading && (data?.items.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground h-24 text-center"
                  >
                    No returns in this queue.
                  </TableCell>
                </TableRow>
              ) : null}

              {data?.items.map((ret) => (
                <TableRow key={ret.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link
                      href={`/returns/${ret.id}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {ret.returnNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(ret.createdAt)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/retailers/${ret.retailerId}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {ret.retailerName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {ret.customer.encodedIdentityKey ? (
                      <Link
                        href={`/customers/${encodeURIComponent(ret.customer.encodedIdentityKey)}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {ret.customer.name ||
                          ret.customer.phone ||
                          ret.customer.email ||
                          "Customer"}
                      </Link>
                    ) : (
                      (ret.customer.name ||
                        ret.customer.phone ||
                        ret.customer.email ||
                        "—")
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/receipts/${ret.receiptId}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {ret.receiptNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {reasonLabel(ret.reasonCode, ret.reason)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={returnStatusBadgeVariant(ret.status)}>
                      {formatStatus(ret.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Showing {rangeStart}–{rangeEnd} of {totalCount}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoPrev}
            onClick={() => void setPage(currentPage - 1)}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoNext}
            onClick={() => void setPage(currentPage + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
