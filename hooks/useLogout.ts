"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import cookieStore from "@/lib/cookiesStore";

/** Clear the session cookie + cached queries and return to the login screen. */
export function useLogout() {
  const router = useRouter();
  const qc = useQueryClient();
  return async () => {
    await cookieStore.remove("token", { path: "/" });
    qc.clear();
    router.push("/login");
    router.refresh();
  };
}
