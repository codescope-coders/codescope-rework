import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateProjectDto,
  ProjectDto,
  UpdateProjectDto,
} from "@/services/projects";

interface ListResponse {
  message: string;
  payload: ProjectDto[];
}

const listApi = new ApiClient<unknown, ListResponse>("/projects");

export const useProjects = () =>
  useQuery({ queryFn: listApi.get, queryKey: ["projects"] });

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["projects"] });
    // Setting a project's system name syncs the matching subscription.
    qc.invalidateQueries({ queryKey: ["subscriptions"] });
  };
}

export const useCreateProject = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["projects", "create"],
    mutationFn: (data: CreateProjectDto) =>
      new ApiClient<CreateProjectDto, { message: string }>("/projects").post(data),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useSaveProject = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["projects", "save"],
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectDto }) =>
      new ApiClient<UpdateProjectDto, { message: string }>(`/projects/${id}`).put(
        data,
      ),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};

export const useDeleteProject = (scss?: (msg: string) => void) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationKey: ["projects", "delete"],
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/projects/${id}`).delete(),
    onSuccess: (res) => {
      invalidate();
      scss?.(res?.message);
    },
  });
};
