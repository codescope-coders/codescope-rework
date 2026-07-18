import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateInvoiceDto,
  InvoiceDto,
  UpdateInvoiceDto,
} from "@/services/invoices";

interface ListResponse {
  message: string;
  payload: InvoiceDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/invoices");

export const useInvoices = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["invoices"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["invoices"] });
}

export const useCreateInvoice = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["invoices", "create"],
    mutationFn: (data: CreateInvoiceDto) =>
      new ApiClient<CreateInvoiceDto, { message: string }>("/invoices").post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useSaveInvoice = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["invoices", "save"],
    mutationFn: ({ id, data }: { id: number; data: UpdateInvoiceDto }) =>
      new ApiClient<UpdateInvoiceDto, { message: string }>(`/invoices/${id}`).put(
        data,
      ),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeleteInvoice = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["invoices", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/invoices/${id}`).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
