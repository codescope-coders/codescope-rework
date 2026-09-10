import { createNavigation } from "next-intl/navigation";
import { internalRouting } from "./config";
export const { Link, usePathname, redirect, useRouter } = createNavigation(internalRouting);
