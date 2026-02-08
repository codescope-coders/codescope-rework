"use client";
import LottiePlayer from "@/components/lotties/LottiePlayer";
import { Link, usePathname } from "@/i18n/routing";
import LogoAnimationData from "@/assets/lotties/header-logo.json";
import { ReactNode } from "react";
import { Briefcase, Files } from "lucide-react";
import clsx from "clsx";
import { IconOnly as LogoIconOnly } from "@/assets/logo/icon-only";

interface LinkType {
  icon: ReactNode;
  name: string;
  path: string;
}

const links: LinkType[] = [
  { name: "Jobs", path: "/dashboard", icon: <Briefcase width={16} /> },
  {
    name: "Applications",
    path: "/dashboard/applications",
    icon: <Files width={16} />,
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="md:w-(--sidebar-width) w-(--collapsed-sidebar-width) bg-white sticky top-0 left-0 h-screen px-0 py-6 flex items-center flex-col shadow-lg shadow-primary/20">
      <Link href={"/dashboard"} className="mb-3">
        <LottiePlayer
          animationData={LogoAnimationData}
          hoverInSegment={[0, 15]}
          hoverOutSegment={[15, 30]}
          iconClassName="w-[200px]"
          className="flex items-center [&_path]:fill-secondary justify-center gap-2 cursor-pointer max-md:hidden"
        ></LottiePlayer>
        <LogoIconOnly className="md:hidden" />
      </Link>
      <span
        className="w-full h-px mb-10 max-md:mb-3"
        style={{
          background: `radial-gradient(circle,  var(--primary), transparent)`,
        }}
      ></span>

      <ul className="w-full flex flex-col">
        {links.map((link, i) => (
          <li key={i}>
            <Link
              href={link.path}
              className={clsx(
                "flex items-center gap-2 font-medium text-base p-4 max-md:p-2 max-md:justify-center duration-300",
                {
                  "bg-primary text-white": pathname == link.path,
                  "hover:bg-primary/15 group": pathname != link.path,
                },
              )}
            >
              <div
                className={clsx(
                  "size-6 flex items-center justify-center rounded-md md:group-hover:translate-x-3 duration-300 delay-50",
                  {
                    "bg-white text-primary": pathname == link.path,
                  },
                )}
              >
                {link.icon}
              </div>{" "}
              <span className="group-hover:translate-x-3 duration-300 max-md:hidden">
                {link.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};
