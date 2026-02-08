"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Inter } from "next/font/google";
import { ComponentProps } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const MainCard = ({
  className,
  ...props
}: ComponentProps<typeof motion.div>) => {
  const t = useTranslations("home.about.mainCard");
  const commonTrans = useTranslations("common");
  return (
    <motion.div
      {...props}
      className={cn(
        "relative rounded-xl w-full overflow-hidden group min-h-fit row-span-3",
        className,
      )}
    >
      <div className="absolute inset-0 bg-primary mix-blend-color opacity-0 transition-opacity duration-200 group-hover:opacity-90 z-10"></div>
      <div className="absolute inset-0 bg-linear-to-r from-black/40 to-black/20 transition-opacity duration-200 z-10"></div>
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none grayscale"
        autoPlay
        muted
        loop
        playsInline
        poster="/home/about-card-poster.jpg"
      >
        <source src="/home/about-card.webm" type="video/webm" />
        <source src="/home/about-card.mp4" type="video/mp4" />
        {commonTrans("video-error")}
      </video>
      <div className="relative z-20 flex flex-col items-start justify-start h-full p-8 md:p-12">
        <div className="flex-1">
          <span
            className={cn(
              "text-sm text-[#a7f46a] font-medium mb-3 font-inter uppercase",
              inter.className,
            )}
          >
            {t("label")}
          </span>

          <h2 className="title text-3xl md:text-4xl font-bold text-[#dcdcdc] leading-[110%] mb-6 max-w-140 pb-24 flex flex-wrap">
            {t("title")}
          </h2>
        </div>

        <Button className="h-12 max-md:mx-auto" variant={"secondary"}>
          <span>{t("button")}</span>
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </Button>
      </div>
    </motion.div>
  );
};
