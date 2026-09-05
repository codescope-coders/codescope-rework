import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  UpdateWebsiteRequestDto,
  WebsiteRequestDto,
} from "@/services/website-requests";

interface ListResponse {
  message: string;
  payload: WebsiteRequestDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/website-requests");

/** The whole queue in one fetch; the view filters client-side so switching a
 *  status tab is instant and the counts on the tabs stay honest. */
export const useWebsiteRequests = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["website-requests"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["website-requests"] });
  };
}

export const useSaveWebsiteRequest = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["website-requests", "save"],
    mutationFn: ({ id, data }: { id: number; data: UpdateWebsiteRequestDto }) =>
      new ApiClient<UpdateWebsiteRequestDto, { message: string }>(
        `/website-requests/${id}`,
      ).put(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
