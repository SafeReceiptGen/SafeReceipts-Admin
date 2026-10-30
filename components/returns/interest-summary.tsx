"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { interestSummaryQueryOptions } from "@/lib/queries/returns";
import { retailersQueryOptions } from "@/lib/queries/retailers";

type InterestMethod = "drop_off" | "home_pickup";

function formatInterestMethod(method: InterestMethod) {
  switch (method) {
    case "drop_off":
      return "PUDO Point Drop-Off";
    case "home_pickup":
      return "Home Pickup";
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

function formatDay(day: string) {
  const parsed = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return day;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function InterestSummary() {
  const [retailerId, setRetailerId] = useState("all");
  const [method, setMethod] = useState<"all" | InterestMethod>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const retailersQuery = useQuery(retailersQueryOptions({ limit: 100 }));
  const summaryQuery = useQuery(
    interestSummaryQueryOptions({
      retailerId: retailerId === "all" ? undefined : retailerId,
      method: method === "all" ? undefined : method,
      from: from || undefined,
      to: to || undefined,
    }),
  );

  const rows = summaryQuery.data ?? [];
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Fulfillment interest</CardTitle>
        <p className="text-muted-foreground text-sm">
          Coming-soon methods customers asked about, by retailer and day. This
          is not the booked fulfillment method.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <Select value={retailerId} onValueChange={setRetailerId}>
            <SelectTrigger className="w-[200px]" aria-label="Retailer">
              <SelectValue placeholder="Retailer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All retailers</SelectItem>
              {(retailersQuery.data?.items ?? []).map((retailer) => (
                <SelectItem key={retailer.id} value={retailer.id}>
                  {retailer.businessName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={method}
            onValueChange={(value) =>
              setMethod(value as "all" | InterestMethod)
            }
          >
            <SelectTrigger className="w-[220px]" aria-label="Interest method">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="drop_off">PUDO Point Drop-Off</SelectItem>
              <SelectItem value="home_pickup">Home Pickup</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="w-[160px]"
            aria-label="Interest from date"
          />
          <Input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="w-[160px]"
            aria-label="Interest to date"
          />
        </div>

        {summaryQuery.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : summaryQuery.isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {summaryQuery.error instanceof Error
              ? summaryQuery.error.message
              : "Failed to load fulfillment interest"}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No interest recorded for this period.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Retailer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={`${row.day}-${row.retailerId}-${row.method}`}
                  >
                    <TableCell>{formatDay(row.day)}</TableCell>
                    <TableCell>{row.retailerName}</TableCell>
                    <TableCell>{formatInterestMethod(row.method)}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {total}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
