"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Database,
  Mail,
  MessageSquare,
  RefreshCw,
  Server,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { platformHealthQueryOptions } from "@/lib/queries/health";
import type {
  PlatformHealthService,
  PlatformHealthStatus,
} from "@/types/admin";
import { cn } from "@/lib/utils";

const SERVICE_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  api: { label: "API", icon: Server },
  database: { label: "Database", icon: Database },
  receipt_generation: { label: "Receipt Generation", icon: FileText },
  email: { label: "Email Service", icon: Mail },
  sms: { label: "SMS Service", icon: MessageSquare },
};

function statusBadgeVariant(
  status: PlatformHealthStatus,
): "success" | "warning" | "destructive" {
  if (status === "healthy") return "success";
  if (status === "warning") return "warning";
  return "destructive";
}

function overallBannerClass(status: PlatformHealthStatus) {
  if (status === "healthy") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }
  if (status === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }
  return "border-destructive/30 bg-destructive/5 text-destructive";
}

function formatCheckedAt(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function ServiceCard({ service }: { service: PlatformHealthService }) {
  const meta = SERVICE_META[service.name] ?? {
    label: service.name,
    icon: Activity,
  };
  const Icon = meta.icon;

  return (
    <Card className="gap-3 py-5">
      <CardHeader className="flex flex-row items-center justify-between px-5">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {meta.label}
        </CardTitle>
        <Icon className="text-muted-foreground size-4" />
      </CardHeader>
      <CardContent className="space-y-3 px-5">
        <Badge variant={statusBadgeVariant(service.status)} className="capitalize">
          {service.status}
        </Badge>
        <p className="text-sm leading-snug">{service.message}</p>
        <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <span>
            Latency:{" "}
            {service.latencyMs == null ? "—" : `${service.latencyMs}ms`}
          </span>
          <span>Checked {formatCheckedAt(service.checkedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function ServiceStatusCards() {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery(
    platformHealthQueryOptions,
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load platform health:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
          overallBannerClass(data.overall),
        )}
      >
        <div className="flex items-center gap-3">
          <Activity className="size-5 shrink-0" />
          <div>
            <p className="font-medium capitalize">
              Overall status: {data.overall}
            </p>
            <p className="text-sm opacity-80">
              Auto-refreshes every 30 seconds
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="bg-background"
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.services.map((service) => (
          <ServiceCard key={service.name} service={service} />
        ))}
      </div>
    </div>
  );
}
