"use client";

import type { AdminReturnTimelineEvent } from "@/types/admin";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReturnTimeline({
  events,
}: {
  events: AdminReturnTimelineEvent[];
}) {
  if (events.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No timeline events yet.</p>
    );
  }

  return (
    <ol className="relative space-y-4 border-l border-border pl-4">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span className="bg-foreground absolute top-1.5 -left-[1.3rem] size-2.5 rounded-full" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{event.label}</p>
            <p className="text-muted-foreground text-xs">
              {formatDate(event.at)}
              {event.actorLabel ? ` · ${event.actorLabel}` : ""}
            </p>
            {typeof event.metadata?.rejectionReason === "string" ? (
              <p className="text-muted-foreground text-xs">
                Reason: {event.metadata.rejectionReason}
              </p>
            ) : null}
            {typeof event.metadata?.refundAmount === "string" ? (
              <p className="text-muted-foreground text-xs">
                Refund: {event.metadata.refundAmount}
              </p>
            ) : null}
            {typeof event.metadata?.bodyPreview === "string" ? (
              <p className="text-muted-foreground text-xs">
                {event.metadata.bodyPreview}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
