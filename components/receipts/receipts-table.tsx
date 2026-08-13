"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { receiptsQueryOptions } from "@/lib/queries/receipts";
import { retailersQueryOptions } from "@/lib/queries/retailers";

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMoney(amount: string, currency: string) {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  return `${currency} ${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function paymentBadgeVariant(
  status: string,
): "success" | "warning" | "secondary" {
  if (status === "paid_in_full") return "success";
  if (status === "partially_paid") return "warning";
  return "secondary";
}

export function ReceiptsTable() {
  const [q, setQ] = useQueryState("q", { defaultValue: "" });
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [retailerId, setRetailerId] = useQueryState(
    "retailerId",
    parseAsString.withDefault(""),
  );
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(""),
  );
  const [paymentMethod, setPaymentMethod] = useQueryState(
    "paymentMethod",
    parseAsString.withDefault(""),
  );
  const [paymentStatus, setPaymentStatus] = useQueryState(
    "paymentStatus",
    parseAsString.withDefault(""),
  );
  const [returnStatus, setReturnStatus] = useQueryState(
    "returnStatus",
    parseAsString.withDefault(""),
  );
  const [from, setFrom] = useQueryState("from", parseAsString.withDefault(""));
  const [to, setTo] = useQueryState("to", parseAsString.withDefault(""));

  const debouncedQ = useDebouncedValue(q, 300);

  const retailersQuery = useQuery(
    retailersQueryOptions({ page: 1, limit: 100 }),
  );

  const { data, isLoading, isError, error } = useQuery(
    receiptsQueryOptions({
      q: debouncedQ || undefined,
      retailerId: retailerId || undefined,
      status: status || undefined,
      paymentMethod: paymentMethod || undefined,
      paymentStatus: paymentStatus || undefined,
      returnStatus: returnStatus || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: PAGE_SIZE,
    }),
  );

  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  async function resetPage() {
    if (page !== 1) await setPage(1);
  }

  async function handleSearchChange(value: string) {
    await setQ(value || null);
    await resetPage();
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-xl">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={q}
          onChange={(e) => void handleSearchChange(e.target.value)}
          placeholder="Search receipt ID, number, customer, retailer, or QR token…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={retailerId || "all"}
          onValueChange={(v) => {
            void setRetailerId(v === "all" ? null : v);
            void resetPage();
          }}
        >
          <SelectTrigger className="w-[180px]">
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

        <Select
          value={status || "all"}
          onValueChange={(v) => {
            void setStatus(v === "all" ? null : v);
            void resetPage();
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="voided">Voided</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentMethod || "all"}
          onValueChange={(v) => {
            void setPaymentMethod(v === "all" ? null : v);
            void resetPage();
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="mobile_money">Mobile money</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="bank_transfer">Bank transfer</SelectItem>
            <SelectItem value="wallet">Wallet</SelectItem>
            <SelectItem value="check">Check</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentStatus || "all"}
          onValueChange={(v) => {
            void setPaymentStatus(v === "all" ? null : v);
            void resetPage();
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partially_paid">Partially paid</SelectItem>
            <SelectItem value="paid_in_full">Paid in full</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={returnStatus || "all"}
          onValueChange={(v) => {
            void setReturnStatus(v === "all" ? null : v);
            void resetPage();
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Return status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any return filter</SelectItem>
            <SelectItem value="none">No returns</SelectItem>
            <SelectItem value="any">Has returns</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={from}
          onChange={(e) => {
            void setFrom(e.target.value || null);
            void resetPage();
          }}
          className="w-[150px]"
          aria-label="From date"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => {
            void setTo(e.target.value || null);
            void resetPage();
          }}
          className="w-[150px]"
          aria-label="To date"
        />
      </div>

      <div className="rounded-xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load receipts"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Retailer / Store</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Return</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-8 text-center"
                  >
                    No receipts found
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      <Link
                        href={`/receipts/${receipt.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {receipt.receiptNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(receipt.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{receipt.retailerName}</span>
                        <span className="text-muted-foreground text-xs">
                          {receipt.storeName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {receipt.customer.encodedIdentityKey ? (
                        <Link
                          href={`/customers/${encodeURIComponent(receipt.customer.encodedIdentityKey)}`}
                          className="text-primary hover:underline"
                        >
                          {receipt.customer.name ??
                            receipt.customer.phone ??
                            "Customer"}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(receipt.total, receipt.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs capitalize">
                          {receipt.paymentMethod.replaceAll("_", " ")}
                        </span>
                        <Badge
                          variant={paymentBadgeVariant(receipt.paymentStatus)}
                        >
                          {receipt.paymentStatus.replaceAll("_", " ")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {receipt.returnSummary ? (
                        <Badge variant="secondary">
                          {receipt.returnSummary.latestStatus.replaceAll(
                            "_",
                            " ",
                          )}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {!isLoading && !isError && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            {totalCount === 0
              ? "Showing 0 of 0"
              : `Showing ${rangeStart}–${rangeEnd} of ${totalCount.toLocaleString()}`}
            <span className="text-muted-foreground/80">
              {" "}
              · Page {currentPage} of {totalPages}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoPrev}
              onClick={() => void setPage(currentPage - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              type="button"
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
      )}
    </div>
  );
}
