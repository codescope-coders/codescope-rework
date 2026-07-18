import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateLeadDto, LeadDto, UpdateLeadDto } from "@/services/pipeline";

interface ListResponse {
  message: string;
  payload: LeadDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/pipeline");

export const useLeads = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["pipeline"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["pipeline"] });
    // A signed lead spawns a pending subscription.
    qc.invalidateQueries({ queryKey: ["subscriptions"] });
  };
}

export const useCreateLead = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["pipeline", "create"],
    mutationFn: (data: CreateLeadDto) =>
      new ApiClient<CreateLeadDto, { message: string }>("/pipeline").post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useSaveLead = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["pipeline", "save"],
    mutationFn: ({ id, data }: { id: number; data: UpdateLeadDto }) =>
      new ApiClient<UpdateLeadDto, { message: string }>(`/pipeline/${id}`).put(
        data,
      ),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeleteLead = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["pipeline", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/pipeline/${id}`).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
