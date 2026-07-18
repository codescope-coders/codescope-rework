import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateRequestDto, RequestDto } from "@/services/requests";

interface ListResponse {
  message: string;
  payload: RequestDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/requests");

export const useRequests = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["requests"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["requests"] });
    // Approval posts an EXPENSE to the ledger and may stamp payroll lastPaid.
    qc.invalidateQueries({ queryKey: ["ledger"] });
    qc.invalidateQueries({ queryKey: ["payroll", "employees"] });
  };
}

export const useCreateRequest = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["requests", "create"],
    mutationFn: (data: CreateRequestDto) =>
      new ApiClient<CreateRequestDto, { message: string }>("/requests").post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDecideRequest = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["requests", "decide"],
    mutationFn: ({ id, decision }: { id: number; decision: "PAID" | "REJECTED" }) =>
      new ApiClient<{ decision: string }, { message: string }>(
        `/requests/${id}`,
      ).put({ decision }),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeleteRequest = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["requests", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/requests/${id}`).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
