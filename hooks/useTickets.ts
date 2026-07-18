import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateTicketDto,
  TicketDto,
  UpdateTicketDto,
} from "@/services/support";

interface ListResponse {
  message: string;
  payload: TicketDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/support");

export const useTickets = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["support"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["support"] });
  };
}

export const useCreateTicket = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["support", "create"],
    mutationFn: (data: CreateTicketDto) =>
      new ApiClient<CreateTicketDto, { message: string }>("/support").post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useSaveTicket = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["support", "save"],
    mutationFn: ({ id, data }: { id: number; data: UpdateTicketDto }) =>
      new ApiClient<UpdateTicketDto, { message: string }>(`/support/${id}`).put(
        data,
      ),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeleteTicket = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["support", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/support/${id}`).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
