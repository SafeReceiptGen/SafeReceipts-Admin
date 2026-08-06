"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { retailersQueryOptions } from "@/lib/queries/retailers";

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function RetailersTable() {
  const [q, setQ] = useQueryState("q", { defaultValue: "" });
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );

  const { data, isLoading, isError, error } = useQuery(
    retailersQueryOptions({
      q: q || undefined,
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

  async function handleSearchChange(value: string) {
    await setQ(value || null);
    if (page !== 1) {
      await setPage(1);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={q}
          onChange={(e) => void handleSearchChange(e.target.value)}
          placeholder="Search by name, TIN, email, phone…"
          className="pl-9"
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
            {error instanceof Error ? error.message : "Failed to load retailers"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receipts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground py-8 text-center"
                  >
                    No retailers found
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((retailer) => (
                  <TableRow key={retailer.id}>
                    <TableCell>
                      <Link
                        href={`/retailers/${retailer.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {retailer.businessName}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {retailer.location ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{retailer.contactEmail ?? "—"}</span>
                        <span className="text-muted-foreground text-xs">
                          {retailer.contactPhone ?? ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(retailer.registeredAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          retailer.accountStatus === "active"
                            ? "success"
                            : "warning"
                        }
                      >
                        {retailer.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {retailer.totalReceipts.toLocaleString()}
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
