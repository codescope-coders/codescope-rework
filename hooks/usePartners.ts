import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreatePartnerDto,
  PartnerDto,
  UpdatePartnerDto,
} from "@/services/partners";

interface ListResponse {
  message: string;
  payload: PartnerDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/partners");

export const usePartners = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["partners"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["partners"] });
  };
}

export const useCreatePartner = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["partners", "create"],
    mutationFn: (data: CreatePartnerDto) =>
      new ApiClient<CreatePartnerDto, { message: string }>("/partners").post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useSavePartner = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["partners", "save"],
    mutationFn: ({ id, data }: { id: number; data: UpdatePartnerDto }) =>
      new ApiClient<UpdatePartnerDto, { message: string }>(`/partners/${id}`).put(
        data,
      ),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeletePartner = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["partners", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/partners/${id}`).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
