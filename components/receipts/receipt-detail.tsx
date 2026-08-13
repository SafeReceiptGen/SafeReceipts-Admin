"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Copy, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  receiptQrQueryOptions,
  receiptQueryOptions,
} from "@/lib/queries/receipts";

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

function statusBadgeVariant(
  status: string,
): "success" | "warning" | "destructive" | "secondary" {
  if (status === "issued") return "success";
  if (status === "voided") return "destructive";
  if (status === "returned") return "warning";
  return "secondary";
}

export function ReceiptDetail({ id }: { id: string }) {
  const [revealOpen, setRevealOpen] = useState(false);
  const [shouldFetchQr, setShouldFetchQr] = useState(false);

  const { data, isLoading, isError, error } = useQuery(receiptQueryOptions(id));
  const qrQuery = useQuery(receiptQrQueryOptions(id, shouldFetchQr));

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
        {error instanceof Error ? error.message : "Receipt not found"}
      </div>
    );
  }

  function openReveal() {
    setShouldFetchQr(true);
    setRevealOpen(true);
  }

  async function copyVerifyUrl() {
    if (!qrQuery.data?.verifyUrl) return;
    try {
      await navigator.clipboard.writeText(qrQuery.data.verifyUrl);
      toast.success("Verify link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="font-display text-2xl">
              {data.receiptNumber}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              {formatDate(data.date)} · {data.retailer.name} / {data.store.name}
            </p>
          </div>
          <Badge variant={statusBadgeVariant(data.status)}>
            {data.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Retailer
              </dt>
              <dd>
                <Link
                  href={`/retailers/${data.retailer.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {data.retailer.name}
                </Link>
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Store
              </dt>
              <dd className="text-sm font-medium">{data.store.name}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Payment method
              </dt>
              <dd className="text-sm font-medium capitalize">
                {data.paymentMethod.replaceAll("_", " ")}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent>
          {data.customer.id ? (
            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <dt className="text-muted-foreground text-xs uppercase">Name</dt>
                <dd>
                  {data.customer.encodedIdentityKey ? (
                    <Link
                      href={`/customers/${encodeURIComponent(data.customer.encodedIdentityKey)}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {data.customer.name ?? "Unnamed customer"}
                    </Link>
                  ) : (
                    <span className="font-medium">
                      {data.customer.name ?? "—"}
                    </span>
                  )}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground text-xs uppercase">
                  Phone
                </dt>
                <dd className="tabular-nums">{data.customer.phone ?? "—"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground text-xs uppercase">
                  Email
                </dt>
                <dd>{data.customer.email ?? "—"}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted-foreground text-sm">No customer on file</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchased items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => {
                const discounted =
                  Number(item.originalPrice) !== Number(item.unitPrice);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      {item.detail ? (
                        <div className="text-muted-foreground text-xs">
                          {item.detail}
                        </div>
                      ) : null}
                      {discounted && item.discountReason ? (
                        <Badge variant="secondary" className="mt-1">
                          {item.discountReason.replaceAll("_", " ")}
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div>
                        {formatMoney(item.unitPrice, data.currency)}
                      </div>
                      {discounted ? (
                        <div className="text-muted-foreground text-xs line-through">
                          {formatMoney(item.originalPrice, data.currency)}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(item.lineTotal, data.currency)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">
                {formatMoney(data.subtotal, data.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                VAT ({data.vatRate}%)
              </span>
              <span className="tabular-nums">
                {formatMoney(data.vatAmount, data.currency)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span className="tabular-nums">
                {formatMoney(data.total, data.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount paid (at issue)</span>
              <span className="tabular-nums">
                {formatMoney(data.amountPaid, data.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance due</span>
              <span className="tabular-nums">
                {formatMoney(data.balanceDue, data.currency)}
              </span>
            </div>
            <div className="pt-1">
              <Badge variant={paymentBadgeVariant(data.paymentStatus)}>
                {data.paymentStatus.replaceAll("_", " ")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment ledger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.payments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No payments recorded</p>
            ) : (
              data.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium tabular-nums">
                      {formatMoney(payment.amount, data.currency)}
                    </p>
                    <p className="text-muted-foreground text-xs capitalize">
                      {payment.paymentMethod.replaceAll("_", " ")}
                      {payment.reference ? ` · ${payment.reference}` : ""}
                    </p>
                    {payment.note ? (
                      <p className="text-muted-foreground text-xs">
                        {payment.note}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(payment.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>QR code</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Token {data.qrCodeTokenMasked} — hidden by default because it
              grants public receipt access and return submission.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={openReveal}>
            <QrCode className="size-4" />
            Reveal QR code
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Returns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Refund</TableHead>
                <TableHead>Timeline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.returns.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground py-8 text-center"
                  >
                    No returns for this receipt
                  </TableCell>
                </TableRow>
              ) : (
                data.returns.map((ret) => (
                  <TableRow key={ret.id}>
                    <TableCell className="font-medium">
                      {ret.returnNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ret.status.replaceAll("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ret.reasonCode?.replaceAll("_", " ") ??
                        ret.reason ??
                        "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {ret.refundAmount
                        ? formatMoney(ret.refundAmount, data.currency)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <div>Requested {formatDate(ret.createdAt)}</div>
                      {ret.reviewedAt ? (
                        <div>Reviewed {formatDate(ret.reviewedAt)}</div>
                      ) : null}
                      {ret.collectedAt ? (
                        <div>Collected {formatDate(ret.collectedAt)}</div>
                      ) : null}
                      {ret.inTransitAt ? (
                        <div>In transit {formatDate(ret.inTransitAt)}</div>
                      ) : null}
                      {ret.withRetailerAt ? (
                        <div>With retailer {formatDate(ret.withRetailerAt)}</div>
                      ) : null}
                      {ret.resolvedAt ? (
                        <div>Resolved {formatDate(ret.resolvedAt)}</div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={revealOpen} onOpenChange={setRevealOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reveal QR code</DialogTitle>
            <DialogDescription>
              Anyone with this link can view the receipt and submit a return.
              Only reveal when assisting a verified customer.
            </DialogDescription>
          </DialogHeader>

          {qrQuery.isLoading ? (
            <Skeleton className="mx-auto size-48" />
          ) : qrQuery.isError || !qrQuery.data ? (
            <p className="text-sm text-destructive">
              {qrQuery.error instanceof Error
                ? qrQuery.error.message
                : "Failed to load QR token"}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="rounded-lg border bg-white p-4">
                <QRCodeSVG value={qrQuery.data.verifyUrl} size={180} />
              </div>
              <p className="text-muted-foreground max-w-full truncate font-mono text-xs">
                {qrQuery.data.verifyUrl}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={!qrQuery.data}
              onClick={() => void copyVerifyUrl()}
            >
              <Copy className="size-4" />
              Copy link
            </Button>
            <Button type="button" onClick={() => setRevealOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
