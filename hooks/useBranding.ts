import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BrandingDto } from "@/services/branding";

export interface BrandingResponse {
  message: string;
  payload: BrandingDto;
}

const api = new ApiClient<Partial<BrandingDto>, BrandingResponse>("/branding");

export const useBranding = () =>
  useQuery({
    queryFn: api.get,
    queryKey: ["branding"],
    staleTime: 10 * 60 * 1000,
  });

export const useUpdateBranding = (scss?: (msg: string) => void) => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["branding"],
    mutationFn: (data: Partial<BrandingDto>) => api.put(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["branding"] });
      scss?.(res?.message);
    },
  });
};
