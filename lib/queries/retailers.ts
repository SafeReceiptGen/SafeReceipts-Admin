import { queryOptions } from "@tanstack/react-query";
import { getAdminRetailer, listAdminRetailers } from "@/lib/api/admin";

export function retailersQueryOptions(params?: {
  q?: string;
  page?: number;
  limit?: number;
}) {
  return queryOptions({
    queryKey: ["admin", "retailers", params ?? {}],
    queryFn: async () => {
      const result = await listAdminRetailers(params);
      if (result.error) {
        throw new Error(result.message);
      }
      return { items: result.data, totalCount: result.totalCount ?? 0 };
    },
  });
}

export function retailerQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["admin", "retailers", id],
    queryFn: async () => {
      const result = await getAdminRetailer(id);
      if (result.error) {
        throw new Error(result.message);
      }
      return result.data;
    },
  });
}
