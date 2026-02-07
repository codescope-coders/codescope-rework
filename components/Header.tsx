"use client";
import { useState } from "react";
import Container from "./Container";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Button } from "./ui/button";
import { Languages } from "lucide-react";
import LottiePlayer from "./lotties/LottiePlayer";
import LogoAnimationData from "@/assets/lotties/header-logo.json";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useVariablesStore } from "@/stores/variables";
import { AnimatedMenuIcon } from "./AnimatedMenuIcon";
import { Sidebar } from "./Sidebar";

const links = [
  {
    name: "about",
    path: "/#about",
  },
  {
    name: "services",
    path: "/#services",
  },
  {
    name: "jobs",
    path: "/jobs",
  },
];

export const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { showContactUs } = useVariablesStore();
  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();

  const selectLang = (locale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  };

  return (
    <>
      <header className="h-18.5 bg-primary">
        <Container className="flex items-center justify-between h-full">
          <Link href={"/"} className="min-w-60">
            <LottiePlayer
              animationData={LogoAnimationData}
              hoverInSegment={[0, 15]}
              hoverOutSegment={[15, 30]}
              className="flex items-center [&_path]:fill-secondary justify-center gap-2 cursor-pointer"
            ></LottiePlayer>
          </Link>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant={"ghost"}
              onClick={() => setIsSidebarOpen(true)}
              className="hover:bg-white/10"
            >
              <AnimatedMenuIcon />
            </Button>
          </div>

          {/* Desktop Navigation */}
          <ul className="flex items-center gap-8 text-white max-lg:hidden">
            {links.map((link, i) => (
              <li key={i}>
                <Link
                  href={link.path}
                  className="font-semibold text-base leading-[150%] hover:text-secondary transition-colors"
                >
                  {t(`links.${link.name}`)}
                </Link>
              </li>
            ))}
            <Link href={"/#tourscope"}>
              <Button variant={"white"} className="uppercase font-bold">
                {t("links.tourscope")}
              </Button>
            </Link>
          </ul>

          {/* Desktop Actions */}
          <div className="flex items-center gap-4 max-lg:hidden">
            <Button
              variant={"ghost"}
              onClick={() => selectLang(locale === "en" ? "ar" : "en")}
              disabled={isPending}
              className="hover:bg-white/10"
            >
              <Languages />
            </Button>
            <Button variant={"secondary"} onClick={showContactUs}>
              {t("links.contact")}
            </Button>
          </div>
        </Container>
      </header>

      {/* Mobile Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};
