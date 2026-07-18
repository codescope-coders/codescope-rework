"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (err) => {
        // Errors carrying a machine-readable `code` are surfaced inline by the
        // feature that threw them (e.g. the OTP login form maps codes to
        // localized copy), so skip the generic toast to avoid a duplicate,
        // non-localized message. Uncoded errors still get the global toast.
        if ((err as { code?: string })?.code) return;
        if (err.message) {
          toast.error(err.message);
        }
      },
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
