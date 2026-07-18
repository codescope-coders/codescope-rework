import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateReportDto,
  ReportDto,
  UpdateReportDto,
} from "@/services/reports";

interface ListResponse {
  message: string;
  payload: ReportDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/reports");

export const useReports = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["reports"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["reports"] });
  };
}

export const useCreateReport = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["reports", "create"],
    mutationFn: (data: CreateReportDto) =>
      new ApiClient<CreateReportDto, { message: string }>("/reports").post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useSaveReport = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["reports", "save"],
    mutationFn: ({ id, data }: { id: number; data: UpdateReportDto }) =>
      new ApiClient<UpdateReportDto, { message: string }>(`/reports/${id}`).put(
        data,
      ),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeleteReport = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["reports", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/reports/${id}`).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
