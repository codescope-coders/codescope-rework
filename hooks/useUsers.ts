import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateUserDto, UpdateUserDto, UserDto } from "@/services/users";

interface ListResponse {
  message: string;
  payload: UserDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/users");

export const useUsers = (enabled = true) =>
  useQuery({
    queryFn: listApi.get,
    queryKey: ["users"],
    staleTime: 5 * 60 * 1000,
    enabled,
  });

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["users"] });
}

export const useCreateUser = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["users", "create"],
    mutationFn: (data: CreateUserDto) =>
      new ApiClient<CreateUserDto, { message: string }>("/users").post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useSaveUser = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["users", "save"],
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      new ApiClient<UpdateUserDto, { message: string }>(`/users/${id}`).put(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeleteUser = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["users", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/users/${id}`).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
