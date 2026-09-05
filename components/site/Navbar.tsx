import { getTranslations } from "next-intl/server";
import { NavbarShell } from "@/components/site/NavbarShell";

export default async function Navbar() {
  const t = await getTranslations("Nav");

  // `/jobs` is this repo's own surface — it has no counterpart in the design
  // source, so it is appended here rather than dropped.
  //
  // `/pricing` sits immediately after `/tourscope`: it prices that product and
  // nothing else, so the two read as a pair. Putting it last — beside Careers —
  // would file the commercial terms under company information.
  const navItems = [
    { href: "/" as const, label: t("home") },
    { href: "/services" as const, label: t("services") },
    { href: "/about" as const, label: t("about") },
    { href: "/tourscope" as const, label: t("tourscope") },
    { href: "/pricing" as const, label: t("pricing") },
    { href: "/jobs" as const, label: t("jobs") },
    { href: "/contact" as const, label: t("contact") },
  ];

  return <NavbarShell navItems={navItems} ctaLabel={t("cta")} />;
}
