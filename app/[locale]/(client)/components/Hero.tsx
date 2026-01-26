"use client";

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimationSequence, stagger, useAnimate } from "motion/react";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { useVariablesStore } from "@/stores/variables";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const SplitWords = ({
  text,
  className,
  wordClass,
}: {
  text: string;
  className?: string;
  wordClass: string;
}) => {
  return (
    <span className={cn("inline-flex flex-wrap", className)}>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          className={cn(
            "inline-block will-change-transform opacity-0",
            wordClass,
          )}
        >
          {word}&nbsp;
        </span>
      ))}
    </span>
  );
};

export const Hero = () => {
  const [scope, animate] = useAnimate();
  const t = useTranslations("home.hero");
  const commonTrans = useTranslations("common");
  useEffect(() => {
    runAnimation();
  }, []);

  const runAnimation = async () => {
    const sequence: AnimationSequence = [
      [
        ".headline-word",
        { opacity: [0, 1], y: [40, 0] },
        {
          delay: stagger(0.07),
          duration: 0.6,
          type: "spring",
          stiffness: 100,
          at: 0.2,
        },
      ],
      [
        ".subheadline-word",
        { opacity: [0, 1], y: [40, 0] },
        {
          delay: stagger(0.07),
          duration: 0.6,
          type: "spring",
          stiffness: 100,
          at: 0.2,
        },
      ],
      [
        ".caption-word",
        { opacity: [0, 1], y: [40, 0] },
        {
          delay: stagger(0.03),
          duration: 0.5,
          type: "spring",
          stiffness: 50,
          at: 0.5,
        },
      ],
      [
        "#hero-button",
        { opacity: [0, 1], y: [40, 0] },
        {
          delay: 0.2,
          duration: 0.5,
          type: "spring",
          stiffness: 80,
          at: 0.5,
        },
      ],
      [
        "#hero-tagline",
        { opacity: [0, 1], x: [40, 0] },
        {
          duration: 0.5,
          type: "spring",
          stiffness: 130,
        },
      ],
      [
        "#hero-taglines-line",
        { width: [0, "4.3125rem"] },
        {
          delay: 0.2,
          duration: 0.5,
          type: "spring",
          stiffness: 80,
          damping: 10,
          at: "<",
        },
      ],
    ];

    animate(sequence);
  };
  const locale = useLocale();

  return (
    <section
      ref={scope}
      className="min-h-[calc(100vh-4.625rem)] bg-secondary flex items-center justify-center relative"
    >
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        poster="/home/hero-poster.jpg"
      >
        <source src="/home/hero.webm" type="video/webm" />
        <source src="/home/hero.mp4" type="video/mp4" />
        {commonTrans("video-error")}
      </video>

      <Container className="relative z-10 text-secondary-foreground">
        <div
          className={cn(
            "flex items-center gap-2 mb-17.25",
            locale == "en" && inter.className,
          )}
        >
          <h1
            id="hero-tagline"
            className="opacity-0 font-medium text-base leading-[160%]"
          >
            {t("tagline")}
          </h1>
          <span id="hero-taglines-line" className="block w-0 h-px bg-white" />
        </div>
        <div className="text-center flex flex-col items-center gap-16">
          <h2
            className="2xl:text-[6.875rem] lg:text-8xl sm:text-7xl text-5xl leading-[100%] rtl:leading-tight"
            style={{ letterSpacing: -1 }}
          >
            <SplitWords
              text={t("headline")}
              wordClass="headline-word font-normal"
            />
            <br />
            <SplitWords
              text={t("subheadline")}
              wordClass="subheadline-word font-black"
            />
          </h2>

          <p className="lg:text-2xl w-full max-w-2xl text-xl text-center">
            <SplitWords
              text={t("caption")}
              wordClass="caption-word"
              className="text-center justify-center"
            />
          </p>

          {/* CTA */}
          <Link href={"/#services"}>
            <Button id="hero-button" className="h-12 opacity-0">
              {t("cta-button")} <ArrowRight className="rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
};
