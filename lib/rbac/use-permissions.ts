"use client";

import { useMemo } from "react";
import { useMe } from "@/hooks/useMe";
import { makeCan, type Can } from "./permissions";

/**
 * Client hook: gate UI (sidebar, action buttons) by the signed-in user's
 * effective permissions. The backend still enforces every gate — this only
 * shapes what the user sees.
 */
export function useCan(): Can {
  const { data } = useMe();
  const perms = data?.payload?.permissions;
  return useMemo(() => makeCan(perms), [perms]);
}
