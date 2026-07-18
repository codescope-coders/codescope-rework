import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateLeaveDto, LeaveDto, UpdateLeaveDto } from "@/services/leaves";

interface ListResponse {
  message: string;
  payload: LeaveDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/leaves");

export const useLeaves = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["leaves"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["leaves"] });
}

export const useCreateLeave = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["leaves", "create"],
    mutationFn: (data: CreateLeaveDto) =>
      new ApiClient<CreateLeaveDto, { message: string }>("/leaves").post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useSaveLeave = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["leaves", "save"],
    mutationFn: ({ id, data }: { id: number; data: UpdateLeaveDto }) =>
      new ApiClient<UpdateLeaveDto, { message: string }>(`/leaves/${id}`).put(
        data,
      ),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeleteLeave = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["leaves", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/leaves/${id}`).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
