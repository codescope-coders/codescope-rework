import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateSubscriptionDto,
  SubscriptionDto,
  UpdateSubscriptionDto,
} from "@/services/subscriptions";

interface ListResponse {
  message: string;
  payload: SubscriptionDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/subscriptions");

export const useSubscriptions = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["subscriptions"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["subscriptions"] });
}

export const useCreateSubscription = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["subscriptions", "create"],
    mutationFn: (data: CreateSubscriptionDto) =>
      new ApiClient<CreateSubscriptionDto, { message: string }>(
        "/subscriptions",
      ).post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useSaveSubscription = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["subscriptions", "save"],
    mutationFn: ({ id, data }: { id: number; data: UpdateSubscriptionDto }) =>
      new ApiClient<UpdateSubscriptionDto, { message: string }>(
        `/subscriptions/${id}`,
      ).put(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeleteSubscription = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["subscriptions", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(
        `/subscriptions/${id}`,
      ).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
