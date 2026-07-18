import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateDistributionDto,
  DistributionDto,
} from "@/services/distributions";

interface ListResponse {
  message: string;
  payload: DistributionDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/distributions");

export const useDistributions = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["distributions"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["distributions"] });
    // A distribution pays partners and posts an EXPENSE per share to the ledger.
    qc.invalidateQueries({ queryKey: ["partners"] });
    qc.invalidateQueries({ queryKey: ["ledger"] });
  };
}

export const useCreateDistribution = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["distributions", "create"],
    mutationFn: (data: CreateDistributionDto) =>
      new ApiClient<CreateDistributionDto, { message: string }>(
        "/distributions",
      ).post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeleteDistribution = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["distributions", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/distributions/${id}`).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
