"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { auditLogsQueryOptions } from "@/lib/queries/audit-logs";

const PAGE_SIZE = 10;

const ACTION_OPTIONS = [
  { value: "receipt.created", label: "Receipt created" },
  { value: "return.requested", label: "Return requested" },
  { value: "return.approved", label: "Return approved" },
  { value: "return.rejected", label: "Return rejected" },
  { value: "retailer.updated", label: "Retailer updated" },
  { value: "admin.retailer_status_updated", label: "Admin retailer status" },
  { value: "admin.qr_revealed", label: "Admin QR revealed" },
] as const;

const ENTITY_OPTIONS = [
  { value: "receipt", label: "Receipt" },
  { value: "return_request", label: "Return request" },
  { value: "retailer", label: "Retailer" },
] as const;

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatAction(action: string) {
  return ACTION_OPTIONS.find((option) => option.value === action)?.label
    ?? action.replaceAll(".", " ").replaceAll("_", " ");
}

function formatActorType(actorType: string) {
  return actorType.replaceAll("_", " ");
}

function entityHref(entityType: string, entityId: string): string | null {
  if (entityType === "receipt") return `/receipts/${entityId}`;
  if (entityType === "retailer") return `/retailers/${entityId}`;
  return null;
}

function metadataSummary(metadata: Record<string, unknown> | null): string {
  if (!metadata || Object.keys(metadata).length === 0) return "—";
  const parts: string[] = [];
  if (typeof metadata.rejectionReason === "string") {
    parts.push(`Reason: ${metadata.rejectionReason}`);
  }
  if (Array.isArray(metadata.changedFields) && metadata.changedFields.length) {
    parts.push(`Changed: ${metadata.changedFields.join(", ")}`);
  }
  if (typeof metadata.accountStatus === "string") {
    parts.push(`Status: ${metadata.accountStatus}`);
  }
  if (typeof metadata.refundAmount === "string") {
    parts.push(`Refund: ${metadata.refundAmount}`);
  }
  if (typeof metadata.previousStatus === "string") {
    parts.push(`From: ${metadata.previousStatus}`);
  }
  if (typeof metadata.receiptNumber === "string") {
    parts.push(`Receipt: ${metadata.receiptNumber}`);
  }
  if (parts.length === 0) {
    return Object.entries(metadata)
      .slice(0, 2)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(" · ");
  }
  return parts.join(" · ");
}

export function AuditLogsTable() {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [action, setAction] = useQueryState(
    "action",
    parseAsString.withDefault(""),
  );
  const [entityType, setEntityType] = useQueryState(
    "entityType",
    parseAsString.withDefault(""),
  );
  const [from, setFrom] = useQueryState("from", parseAsString.withDefault(""));
  const [to, setTo] = useQueryState("to", parseAsString.withDefault(""));

  const { data, isLoading, isError, error } = useQuery(
    auditLogsQueryOptions({
      action: action || undefined,
      entityType: entityType || undefined,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select
          value={action || "all"}
          onValueChange={(value) => {
            void setAction(value === "all" ? null : value);
            void resetPage();
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {ACTION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={entityType || "all"}
          onValueChange={(value) => {
            void setEntityType(value === "all" ? null : value);
            void resetPage();
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All entities</SelectItem>
            {ENTITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
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
            {error instanceof Error
              ? error.message
              : "Failed to load audit logs"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground py-8 text-center"
                  >
                    No audit events found
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((log) => {
                  const href = entityHref(log.entityType, log.entityId);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatTimestamp(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{log.actorLabel}</span>
                          <Badge variant="outline" className="capitalize">
                            {formatActorType(log.actorType)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatAction(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-xs capitalize">
                            {log.entityType.replaceAll("_", " ")}
                          </span>
                          {href ? (
                            <Link
                              href={href}
                              className="font-medium text-primary hover:underline"
                            >
                              {log.entityLabel}
                            </Link>
                          ) : (
                            <span className="font-medium">{log.entityLabel}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {metadataSummary(log.metadata)}
                      </TableCell>
                    </TableRow>
                  );
                })
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
