import ApiClient from "@/lib/apiClient";
import { LoginResponse } from "@/services/admin";
import { useMutation } from "@tanstack/react-query";

export type SuccessFunc = (message?: string) => void;

export const useLogin = (scss?: SuccessFunc) => {
  const api = new ApiClient<Object, LoginResponse>("/auth");

  return useMutation({
    mutationFn: (data: Object) => api.post(data),
    mutationKey: ["login"],
    onSuccess: (res) => {
      scss?.(res.message);
    },
  });
};
