import ApiClient from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import type { Role } from "@/lib/rbac/permissions";

export interface MeUser {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  permissions: string[];
}

export interface MeResponse {
  message: string;
  payload: MeUser;
}

const api = new ApiClient<unknown, MeResponse>("/auth/me");

/** The signed-in console user + effective permissions. Deduped across the shell. */
export const useMe = () =>
  useQuery({
    queryFn: api.get,
    queryKey: ["me"],
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
