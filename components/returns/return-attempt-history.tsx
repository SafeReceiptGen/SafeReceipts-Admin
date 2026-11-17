"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AdminReturnAttempt } from "@/types/admin";

const RETURN_STATUSES = [
  "pending",
  "pickup_scheduled",
  "approved",
  "rejected",
  "completed",
  "cancelled",
  "collected",
  "in_transit",
  "with_retailer",
  "refunded",
  "refund_completed",
  "exchange_completed",
] as const;

type ReturnStatus = (typeof RETURN_STATUSES)[number];

const REASON_LABELS: Record<string, string> = {
  defective: "Defective",
  wrong_item: "Wrong item",
  changed_mind: "Changed mind",
  damaged_in_delivery: "Damaged in delivery",
  other: "Other",
};

function isReturnStatus(status: string): status is ReturnStatus {
  return (RETURN_STATUSES as readonly string[]).includes(status);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(amount: string | null, currency: string) {
  if (amount == null) return "—";
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  return `${currency} ${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusLabel(status: ReturnStatus): string {
  switch (status) {
    case "pending":
      return "Pending review";
    case "pickup_scheduled":
      return "Pickup scheduled";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "cancelled":
      return "Cancelled";
    case "collected":
      return "Collected";
    case "in_transit":
      return "In transit";
    case "with_retailer":
      return "Item received";
    case "refunded":
    case "refund_completed":
      return "Refund processed";
    case "exchange_completed":
      return "Exchange processed";
    case "completed":
      return "Completed";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function decisionLabel(
  status: ReturnStatus,
): "Awaiting decision" | "Denied" | "Cancelled" | "Approved" {
  switch (status) {
    case "pending":
    case "pickup_scheduled":
      return "Awaiting decision";
    case "rejected":
      return "Denied";
    case "cancelled":
      return "Cancelled";
    case "approved":
    case "completed":
    case "collected":
    case "in_transit":
    case "with_retailer":
    case "refunded":
    case "refund_completed":
    case "exchange_completed":
      return "Approved";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function statusBadgeVariant(
  status: ReturnStatus,
): "success" | "warning" | "destructive" | "secondary" {
  switch (status) {
    case "approved":
    case "refunded":
    case "completed":
    case "refund_completed":
    case "exchange_completed":
      return "success";
    case "rejected":
    case "cancelled":
      return "destructive";
    case "pending":
    case "pickup_scheduled":
      return "warning";
    case "collected":
    case "in_transit":
    case "with_retailer":
      return "secondary";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function decisionBadgeVariant(
  decision: ReturnType<typeof decisionLabel>,
): "success" | "warning" | "destructive" | "secondary" {
  switch (decision) {
    case "Awaiting decision":
      return "warning";
    case "Denied":
      return "destructive";
    case "Cancelled":
      return "secondary";
    case "Approved":
      return "success";
    default: {
      const exhaustive: never = decision;
      return exhaustive;
    }
  }
}

function refundTypeLabel(refundType: string | null | undefined) {
  switch (refundType) {
    case "full_refund":
      return "Full refund";
    case "partial_refund":
      return "Partial refund";
    case "store_credit":
      return "Store credit";
    case "exchange_only":
      return "Exchange";
    case null:
    case undefined:
      return "—";
    default:
      return refundType.replaceAll("_", " ");
  }
}

function reasonLabel(attempt: AdminReturnAttempt) {
  if (attempt.reasonCode && REASON_LABELS[attempt.reasonCode]) {
    return REASON_LABELS[attempt.reasonCode];
  }
  return attempt.reason?.trim() || attempt.reasonCode || "—";
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export function ReturnAttemptHistory({
  attempts,
  currency,
  currentAttemptId,
}: {
  attempts: AdminReturnAttempt[] | null | undefined;
  currency: string;
  currentAttemptId?: string;
}) {
  const list = attempts ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Return attempts</CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No returns for this receipt
          </p>
        ) : (
          <div className="space-y-4">
            {list.map((attempt) => {
              const current = attempt.id === currentAttemptId;
              const knownStatus = isReturnStatus(attempt.status)
                ? attempt.status
                : null;
              const items = attempt.items ?? [];
              const decision = knownStatus ? decisionLabel(knownStatus) : null;

              return (
                <article
                  key={attempt.id}
                  className={cn(
                    "rounded-lg border p-4",
                    current && "border-primary/40 bg-primary/5",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/returns/${attempt.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {attempt.returnNumber}
                    </Link>
                    <Badge
                      variant={
                        knownStatus
                          ? statusBadgeVariant(knownStatus)
                          : "secondary"
                      }
                    >
                      {knownStatus
                        ? statusLabel(knownStatus)
                        : (attempt.status ?? "unknown").replaceAll("_", " ")}
                    </Badge>
                    {decision ? (
                      <Badge variant={decisionBadgeVariant(decision)}>
                        {decision}
                      </Badge>
                    ) : null}
                    {current ? (
                      <Badge variant="outline">This request</Badge>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Request ID">
                      <span className="font-mono text-xs break-all">
                        {attempt.id}
                      </span>
                    </Field>
                    <Field label="Requested">{formatDate(attempt.createdAt)}</Field>
                    <Field label="Reviewed">{formatDate(attempt.reviewedAt)}</Field>
                    <Field label="Reason">{reasonLabel(attempt)}</Field>
                    <Field label="Refund type">
                      {refundTypeLabel(attempt.refundType)}
                    </Field>
                    <Field label="Refund">
                      {formatMoney(attempt.refundAmount, currency)}
                    </Field>
                  </div>

                  {attempt.description?.trim() ? (
                    <div className="mt-4">
                      <Field label="Customer description">
                        {attempt.description.trim()}
                      </Field>
                    </div>
                  ) : null}

                  <div className="mt-4">
                    <Field label="Items">
                      {items.length === 0 ? (
                        "—"
                      ) : (
                        <ul className="space-y-1">
                          {items.map((item) => (
                            <li key={item.id}>
                              {item.name}{" "}
                              <span className="text-muted-foreground tabular-nums">
                                × {item.quantityReturned}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Field>
                  </div>

                  {attempt.rejectionReason ? (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/20 dark:bg-red-500/10">
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">
                        Denial reason
                      </p>
                      <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                        {attempt.rejectionReason}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
