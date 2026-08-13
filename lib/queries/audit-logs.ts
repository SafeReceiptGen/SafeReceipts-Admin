import { queryOptions } from "@tanstack/react-query";
import { listAdminAuditLogs } from "@/lib/api/admin";

export function auditLogsQueryOptions(params?: {
  action?: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  return queryOptions({
    queryKey: ["admin", "audit-logs", params ?? {}],
    queryFn: async () => {
      const result = await listAdminAuditLogs(params);
      if (result.error) {
        throw new Error(result.message);
      }
      return { items: result.data, totalCount: result.totalCount ?? 0 };
    },
  });
}
