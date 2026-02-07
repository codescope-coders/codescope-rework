import ApiClient from "@/lib/apiClient";
import {
  CreateJobDto,
  GetAllJobsResponse,
  JobDto,
  UpdateJobDto,
} from "@/services/jobs";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetJobs = (params?: {}) => {
  const api = new ApiClient<any, GetAllJobsResponse>("/jobs");
  return useQuery({
    queryFn: api.get,
    queryKey: ["jobs", params],
    meta: { params },
  });
};
export const useGetJobById = (id: number | string) => {
  const api = new ApiClient<any, { message: String; payload: JobDto }>(
    `/jobs/${id}`,
  );
  return useQuery({
    queryFn: api.get,
    queryKey: ["jobs", id],
  });
};

export const useCreateJob = (scss?: (msg: string) => void) => {
  const api = new ApiClient<CreateJobDto, { message: string }>("/jobs");
  return useMutation({
    mutationFn: api.post,
    mutationKey: ["jobs"],
    onSuccess: (res) => {
      scss?.(res?.message);
    },
  });
};
export const useEditJob = (id: number, scss?: (msg: string) => void) => {
  const api = new ApiClient<UpdateJobDto, { message: string }>(`/jobs/${id}`);
  return useMutation({
    mutationFn: (data: UpdateJobDto) => api.put(data),
    mutationKey: ["jobs"],
    onSuccess: (res) => {
      scss?.(res?.message);
    },
  });
};

export const useToggleJob = (id: number, scss?: (msg: string) => void) => {
  const api = new ApiClient<any, { message: string }>(`/jobs/${id}/toggle`);
  return useMutation({
    mutationFn: () => api.put(),
    mutationKey: ["jobs", id],
    onSuccess: (res) => {
      scss?.(res?.message);
    },
  });
};
export const useDeleteJob = (id: number, scss?: (msg: string) => void) => {
  const api = new ApiClient<any, { message: string }>(`/jobs/${id}`);
  return useMutation({
    mutationFn: () => api.delete(),
    mutationKey: ["jobs", id],
    onSuccess: (res) => {
      scss?.(res?.message);
    },
  });
};
