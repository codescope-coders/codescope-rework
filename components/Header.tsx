"use client";
import Container from "./Container";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Button } from "./ui/button";
import { Languages, Menu } from "lucide-react";
import LottiePlayer from "./lotties/LottiePlayer";
import LogoAnimationData from "@/assets/lotties/header-logo.json";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useVariablesStore } from "@/stores/variables";

const links = [
  {
    name: "about",
    path: "#about",
  },
  {
    name: "services",
    path: "#services",
  },
];

export const Header = () => {
  const { showContactUs } = useVariablesStore();

  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const selectLang = (locale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  };

  const locale = useLocale();

  return (
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
        <div className="sidebar-menu md:hidden">
          <Button variant={"ghost"}>
            <Menu width={20} className="min-w-4" />
          </Button>
        </div>
        <ul className="flex items-center gap-8 text-white max-md:hidden">
          {links.map((link, i) => (
            <li key={i}>
              {/* {link.path.includes("#") && (
                <button
                  className="font-semibold text-base leading-[150%] cursor-pointer"
                  onClick={() => getLenis()?.scrollTo(link.path)}
                >
                  {t(`links.${link.name}`)}
                </button>
              )} */}
              {
                <Link
                  href={link.path}
                  className="font-semibold text-base leading-[150%]"
                >
                  {t(`links.${link.name}`)}
                </Link>
              }
            </li>
          ))}
          <Link href={"/#tourscope"}>
            <Button variant={"white"} className="uppercase font-bold!">
              {t("links.tourscope")}
            </Button>
          </Link>
        </ul>
        <div className="flex items-center gap-4 max-md:hidden">
          <Button
            variant={"ghost"}
            onClick={() => selectLang(locale === "en" ? "ar" : "en")}
            disabled={isPending}
          >
            <Languages />
          </Button>
          <Button variant={"secondary"} onClick={showContactUs}>
            {t("links.contact")}
          </Button>
        </div>
      </Container>
    </header>
  );
};
