import { queryOptions } from "@tanstack/react-query";
import {
  getAdminReturn,
  listAdminReturns,
} from "@/lib/api/admin";
import type { AdminReturnTabCounts } from "@/types/admin";

const emptyTabCounts: AdminReturnTabCounts = {
  pending: 0,
  approved: 0,
  rejected: 0,
  completed: 0,
};

export function returnsQueryOptions(params?: {
  q?: string;
  tab?: string;
  status?: string;
  retailerId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  return queryOptions({
    queryKey: ["admin", "returns", params ?? {}],
    queryFn: async () => {
      const result = await listAdminReturns(params);
      if (result.error) {
        throw new Error(result.message);
      }
      const meta = result.meta as { tabCounts?: AdminReturnTabCounts } | undefined;
      return {
        items: result.data,
        totalCount: result.totalCount ?? 0,
        tabCounts: meta?.tabCounts ?? emptyTabCounts,
      };
    },
  });
}

export function returnQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["admin", "returns", id],
    queryFn: async () => {
      const result = await getAdminReturn(id);
      if (result.error) {
        throw new Error(result.message);
      }
      return result.data;
    },
  });
}
