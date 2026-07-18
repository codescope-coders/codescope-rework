import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateLedgerEntryDto,
  LedgerEntryDto,
  UpdateLedgerEntryDto,
} from "@/services/ledger";

interface ListResponse {
  message: string;
  payload: LedgerEntryDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/ledger");

export const useLedger = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["ledger"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["ledger"] });
}

export const useCreateLedgerEntry = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["ledger", "create"],
    mutationFn: (data: CreateLedgerEntryDto) =>
      new ApiClient<CreateLedgerEntryDto, { message: string }>("/ledger").post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useSaveLedgerEntry = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["ledger", "save"],
    mutationFn: ({ id, data }: { id: number; data: UpdateLedgerEntryDto }) =>
      new ApiClient<UpdateLedgerEntryDto, { message: string }>(`/ledger/${id}`).put(
        data,
      ),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeleteLedgerEntry = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["ledger", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/ledger/${id}`).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
