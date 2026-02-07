import ApiClient from "@/lib/apiClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export type UploadCvResponse = {
  success: boolean;
  message: string;
  cvUrl: string;
  fileName: string;
};

export const useUpload = (scss?: (msg: string) => void) => {
  const api = new ApiClient<FormData, UploadCvResponse>("/upload");
  return useMutation({
    mutationFn: api.post,
    mutationKey: ["upload"],
    onSuccess: (res) => {
      toast.success(res.message);
      scss?.(res.message);
    },
  });
};
