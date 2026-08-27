"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { returnQueryOptions } from "@/lib/queries/returns";
import { ReturnNotes } from "@/components/returns/return-notes";
import { ReturnTimeline } from "@/components/returns/return-timeline";

const REASON_LABELS: Record<string, string> = {
  defective: "Defective",
  wrong_item: "Wrong item",
  changed_mind: "Changed mind",
  damaged_in_delivery: "Damaged in delivery",
  other: "Other",
};

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

export function ReturnDetail({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useQuery(returnQueryOptions(id));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error instanceof Error ? error.message : "Return not found"}
      </div>
    );
  }

  const currency = data.receipt.currency;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {data.returnNumber}
            </h2>
            <Badge variant={returnStatusBadgeVariant(data.status)}>
              {formatStatus(data.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Submitted {formatDate(data.createdAt)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Approve and reject are handled by the retailer in the merchant
            portal.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Original receipt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Receipt">
              <Link
                href={`/receipts/${data.receipt.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {data.receipt.receiptNumber}
              </Link>
            </Field>
            <Field label="Date">{formatDate(data.receipt.date)}</Field>
            <Field label="Total">
              {formatMoney(data.receipt.total, currency)}
            </Field>
            <Field label="Status">{formatStatus(data.receipt.status)}</Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Name">
              {data.customer.encodedIdentityKey ? (
                <Link
                  href={`/customers/${encodeURIComponent(data.customer.encodedIdentityKey)}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {data.customer.name || "View profile"}
                </Link>
              ) : (
                (data.customer.name || "—")
              )}
            </Field>
            <Field label="Phone">{data.customer.phone || "—"}</Field>
            <Field label="Email">{data.customer.email || "—"}</Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Retailer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Business">
              <Link
                href={`/retailers/${data.retailer.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {data.retailer.name}
              </Link>
            </Field>
            <Field label="Store">{data.store.name}</Field>
            <Field label="Account">
              <Badge
                variant={data.retailer.isActive ? "success" : "destructive"}
              >
                {data.retailer.isActive ? "Active" : "Disabled"}
              </Badge>
            </Field>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Return reason</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Reason">
            {reasonLabel(data.reasonCode, data.reason)}
          </Field>
          <Field label="Customer description">
            {data.description?.trim() || "—"}
          </Field>
          {data.rejectionReason ? (
            <Field label="Rejection reason">{data.rejectionReason}</Field>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Requested items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty returned</TableHead>
                <TableHead>Unit price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground text-center"
                  >
                    No items
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      {item.detail ? (
                        <div className="text-muted-foreground text-xs">
                          {item.detail}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>{item.quantityReturned}</TableCell>
                    <TableCell>
                      {formatMoney(item.unitPrice, currency)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Refund & logistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Refund type">
              {formatStatus(data.refundType)}
            </Field>
            <Field label="Refund amount">
              {formatMoney(data.refundAmount, currency)}
            </Field>
            <Field label="Service fee">
              {formatMoney(data.serviceFee, currency)}
            </Field>
            <Separator />
            <Field label="Method">
              {data.logisticsMethod
                ? formatStatus(data.logisticsMethod)
                : "—"}
            </Field>
            <Field label="Time slot">{data.logisticsTimeSlot || "—"}</Field>
            <Field label="Phone">
              {data.logisticsPhone
                ? `${data.logisticsPhoneCountry ?? ""} ${data.logisticsPhone}`.trim()
                : "—"}
            </Field>
            {data.logisticsMethod === "home_pickup" ? (
              <Field label="Pickup address">
                {[
                  data.pickupAddressLine1,
                  data.pickupAddressLine2,
                  data.pickupCity,
                  data.pickupRegion,
                  data.pickupPostalCode,
                ]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </Field>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Evidence photos</CardTitle>
          </CardHeader>
          <CardContent>
            {data.photos.length === 0 ? (
              <p className="text-muted-foreground text-sm">No photos uploaded.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {data.photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-muted block overflow-hidden rounded-md border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt="Return evidence"
                      className="aspect-square w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ReturnTimeline events={data.timeline} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Internal notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ReturnNotes returnId={data.id} notes={data.notes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
