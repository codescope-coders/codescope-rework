import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateServerDto,
  ServerDto,
  UpdateServerDto,
} from "@/services/servers";

interface ListResponse {
  message: string;
  payload: ServerDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/servers");

export const useServers = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["servers"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["servers"] });
  };
}

export const useCreateServer = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["servers", "create"],
    mutationFn: (data: CreateServerDto) =>
      new ApiClient<CreateServerDto, { message: string }>("/servers").post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useSaveServer = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["servers", "save"],
    mutationFn: ({ id, data }: { id: number; data: UpdateServerDto }) =>
      new ApiClient<UpdateServerDto, { message: string }>(`/servers/${id}`).put(
        data,
      ),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeleteServer = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["servers", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/servers/${id}`).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
