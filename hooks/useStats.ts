import ApiClient from "@/lib/apiClient";
import { GetStatsResponse } from "@/services/stats";
import { useQuery } from "@tanstack/react-query";

export const useGetStats = () => {
  const api = new ApiClient<any, GetStatsResponse>("/stats");
  return useQuery({
    queryFn: api.get,
    queryKey: ["stats"],
  });
};
