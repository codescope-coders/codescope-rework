import ApiClient from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import type { AppNotification } from "@/services/notifications";

export interface NotificationsResponse {
  message: string;
  payload: AppNotification[];
}

const api = new ApiClient<unknown, NotificationsResponse>("/notifications");

export const useNotifications = () =>
  useQuery({
    queryFn: api.get,
    queryKey: ["notifications"],
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

export type { AppNotification };
