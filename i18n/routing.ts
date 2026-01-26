import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export type supportedlocales = "en" | "ar";

export const routing = defineRouting({
  locales: ["en", "ar"] as supportedlocales[],
  defaultLocale: "en",
  localePrefix: {
    mode: "as-needed",
  },
});

export const { Link, usePathname, redirect, useRouter } =
  createNavigation(routing);
