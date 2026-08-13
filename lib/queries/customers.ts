import { queryOptions } from "@tanstack/react-query";
import { getAdminCustomer, listAdminCustomers } from "@/lib/api/admin";

export function customersQueryOptions(params?: {
  q?: string;
  page?: number;
  limit?: number;
}) {
  return queryOptions({
    queryKey: ["admin", "customers", params ?? {}],
    queryFn: async () => {
      const result = await listAdminCustomers(params);
      if (result.error) {
        throw new Error(result.message);
      }
      return { items: result.data, totalCount: result.totalCount ?? 0 };
    },
  });
}

export function customerQueryOptions(encodedKey: string) {
  return queryOptions({
    queryKey: ["admin", "customers", encodedKey],
    queryFn: async () => {
      const result = await getAdminCustomer(encodedKey);
      if (result.error) {
        throw new Error(result.message);
      }
      return result.data;
    },
  });
}
