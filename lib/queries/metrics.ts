import { queryOptions } from "@tanstack/react-query";
import { getAdminMetrics } from "@/lib/api/admin";

export const metricsQueryOptions = queryOptions({
  queryKey: ["admin", "metrics"],
  queryFn: async () => {
    const result = await getAdminMetrics();
    if (result.error) {
      throw new Error(result.message);
    }
    return result.data;
  },
});
