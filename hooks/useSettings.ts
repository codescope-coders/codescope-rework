import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SettingsDto } from "@/services/settings";

export interface SettingsResponse {
  message: string;
  payload: SettingsDto;
}

const api = new ApiClient<Partial<SettingsDto>, SettingsResponse>("/settings");

export const useSettings = () =>
  useQuery({
    queryFn: api.get,
    queryKey: ["settings"],
    staleTime: 10 * 60 * 1000,
  });

export const useUpdateSettings = (scss?: (msg: string) => void) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["settings"],
    mutationFn: (data: Partial<SettingsDto>) => api.put(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      scss?.(res?.message);
    },
  });
};
