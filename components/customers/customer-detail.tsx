"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { customerQueryOptions } from "@/lib/queries/customers";

function formatDate(iso: string) {
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

export function CustomerDetail({ encodedKey }: { encodedKey: string }) {
  const { data, isLoading, isError, error } = useQuery(
    customerQueryOptions(encodedKey),
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error instanceof Error ? error.message : "Customer not found"}
      </div>
    );
  }

  const spendEntries = Object.entries(data.summary.lifetimeSpendByCurrency);
  const outstandingEntries = Object.entries(
    data.summary.outstandingByCurrency,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            {data.displayName ?? "Unnamed customer"}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Seen at {data.identities.length}{" "}
            {data.identities.length === 1 ? "retailer" : "retailers"}
          </p>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Phone
              </dt>
              <dd className="text-sm font-medium tabular-nums">
                {data.phone ?? "—"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Email
              </dt>
              <dd className="text-sm font-medium">{data.email ?? "—"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Identity key
              </dt>
              <dd className="text-muted-foreground font-mono text-xs">
                {data.identityKey}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Receipts
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-2xl font-semibold tabular-nums">
            {data.summary.totalReceipts.toLocaleString()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Lifetime spend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm font-medium">
            {spendEntries.length === 0
              ? "—"
              : spendEntries.map(([cur, amt]) => (
                  <div key={cur} className="tabular-nums">
                    {formatMoney(amt, cur)}
                  </div>
                ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm font-medium">
            {outstandingEntries.length === 0
              ? "—"
              : outstandingEntries.map(([cur, amt]) => (
                  <div key={cur} className="tabular-nums">
                    {formatMoney(amt, cur)}
                  </div>
                ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Returns
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-2xl font-semibold tabular-nums">
            {data.summary.returnsCount.toLocaleString()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Retailer identities</CardTitle>
          <p className="text-muted-foreground text-sm">
            Why these rows were grouped — one entry per retailer contact record.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.identities.map((identity, index) => (
            <div key={identity.customerId}>
              {index > 0 ? <Separator className="mb-4" /> : null}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/retailers/${identity.retailerId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {identity.retailerName}
                    </Link>
                    <Badge
                      variant={
                        identity.retailerIsActive ? "success" : "warning"
                      }
                    >
                      {identity.retailerIsActive ? "active" : "disabled"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Joined {formatDate(identity.joinedAt)}
                  </p>
                </div>
                <dl className="grid gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-muted-foreground text-xs uppercase">
                      Name
                    </dt>
                    <dd>{identity.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs uppercase">
                      Phone
                    </dt>
                    <dd className="tabular-nums">{identity.phone ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs uppercase">
                      Email
                    </dt>
                    <dd>{identity.email ?? "—"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="receipts">
        <TabsList>
          <TabsTrigger value="receipts">
            Receipt history ({data.receiptHistory.length})
          </TabsTrigger>
          <TabsTrigger value="returns">
            Return history ({data.returnHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receipts" className="mt-4">
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Retailer / Store</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Return</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.receiptHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No receipts
                    </TableCell>
                  </TableRow>
                ) : (
                  data.receiptHistory.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(receipt.date)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/receipts/${receipt.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {receipt.receiptNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{receipt.retailerName}</span>
                          <span className="text-muted-foreground text-xs">
                            {receipt.storeName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(receipt.total, receipt.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={paymentBadgeVariant(receipt.paymentStatus)}
                        >
                          {receipt.paymentStatus.replaceAll("_", " ")}
                        </Badge>
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
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="returns" className="mt-4">
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested</TableHead>
                  <TableHead>Return #</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Refund</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.returnHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No returns
                    </TableCell>
                  </TableRow>
                ) : (
                  data.returnHistory.map((ret) => (
                    <TableRow key={ret.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(ret.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {ret.returnNumber}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/receipts/${ret.receiptId}`}
                          className="text-primary hover:underline"
                        >
                          {ret.receiptNumber}
                        </Link>
                        <div className="text-muted-foreground text-xs">
                          {ret.retailerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {ret.status.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {ret.reasonCode?.replaceAll("_", " ") ??
                          ret.reason ??
                          "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {ret.refundAmount ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
