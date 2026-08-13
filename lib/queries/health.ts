import { queryOptions } from "@tanstack/react-query";
import { getAdminPlatformHealth } from "@/lib/api/admin";

export const platformHealthQueryOptions = queryOptions({
  queryKey: ["admin", "health"],
  queryFn: async () => {
    const result = await getAdminPlatformHealth();
    if (result.error) {
      throw new Error(result.message);
    }
    return result.data;
  },
  staleTime: 0,
  refetchInterval: 30_000,
});
