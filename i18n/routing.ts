import { createNavigation } from "next-intl/navigation";
import { routing } from "./config";
export { routing, LOCALE_COOKIE, type supportedlocales } from "./config";
export const { Link, usePathname, redirect, useRouter } = createNavigation(routing);
