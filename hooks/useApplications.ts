import ApiClient from "@/lib/apiClient";
import { queryClient } from "@/lib/queryClientProvider";
import {
  ApplicationDto,
  CreateApplicationDto,
  UpdateApplicationDto,
} from "@/services/applications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetApplications = (params?: {}) => {
  const api = new ApiClient<any, { payload: ApplicationDto[] }>(
    "/applications",
  );
  return useQuery({
    queryFn: api.get,
    queryKey: ["applications", params],
    meta: { params },
  });
};

export const useCreateApplication = (
  scss?: (msg: string) => void,
  p0?: (error: any) => void,
) => {
  const api = new ApiClient<CreateApplicationDto, { message: string }>(
    `/applications`,
  );
  return useMutation({
    mutationFn: api.post,
    mutationKey: ["applications"],
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      scss?.(res.message);
    },
  });
};
export const useUpdateApplication = (id: number) => {
  const api = new ApiClient<UpdateApplicationDto, { message: string }>(
    `/applications/${id}`,
  );
  return useMutation({
    mutationFn: (data: UpdateApplicationDto) => api.put(data),
    mutationKey: ["applications"],
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
};

export const useDeleteApplication = (id: number) => {
  const api = new ApiClient<any, { message: string }>(`/applications/${id}`);
  return useMutation({
    mutationFn: () => api.delete(),
    mutationKey: ["applications", id],
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success(res.message);
    },
  });
};
