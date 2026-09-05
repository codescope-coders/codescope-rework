import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Nav");

  // Careers was missing entirely: the nav carried it, the footer did not, so
  // the one place a visitor looks for it after reading the page about the
  // company had no link to it. Pricing joins at the same time, in the nav's
  // order, so the two lists cannot be read as describing different sites.
  const links = [
    { href: "/" as const, label: t("home") },
    { href: "/services" as const, label: t("services") },
    { href: "/about" as const, label: t("about") },
    { href: "/tourscope" as const, label: t("tourscope") },
    { href: "/pricing" as const, label: t("pricing") },
    { href: "/jobs" as const, label: t("careers") },
    { href: "/contact" as const, label: nav("contact") },
  ];

  return (
    <footer className="border-t border-white/5 bg-zinc-950 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/Branding/logomark.svg"
              alt="CodeScope"
              width={110}
              height={43}
              className="h-7 w-auto"
            />
          </Link>
          {/* The footer carries the only sentence on the site that says what
              the company IS. It was set at `zinc-700` — 1.7:1 on this ground,
              which is not de-emphasis, it is invisible. The hierarchy between
              the two lines is kept; both now clear AA. */}
          <p className="text-sm text-zinc-300 leading-relaxed max-w-[36ch]">
            {t("tagline")}
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1 max-w-[36ch]">
            {t("subtagline")}
          </p>
        </div>

        {/* Links */}
        <nav aria-label={t("links")}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-5">
            {t("links")}
          </h2>
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-5">
            {t("contact")}
          </h2>
          <a
            href={`mailto:${t("email")}`}
            className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
          >
            {t("email")}
          </a>
        </div>
      </div>

      <div className="border-t border-white/5 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-zinc-400">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
