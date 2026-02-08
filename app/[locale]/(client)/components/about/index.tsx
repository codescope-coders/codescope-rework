"use client";
import Container from "@/components/Container";
import { Card } from "./Card";
import { MainCard } from "./mainCard";
import { useRef } from "react";
import { useInView } from "motion/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export const About = () => {
  const section = useRef(null);

  const isInView = useInView(section, {
    margin: "0% 0px -60% 0px",
    once: true,
  });
  const t = useTranslations("home.about");
  return (
    <section
      className="bg-background overflow-hidden xl:py-32 py-20 max-sm:pb-10"
      id="about"
      ref={section}
    >
      <Container id="abouts-container">
        <div className="md:mb-27 mb-10 flex justify-between text-black md:gap-20 gap-6 max-md:flex-col max-md:items-start">
          <motion.h2
            className="text-6xl font-bold min-w-3xs"
            id="about-title"
            animate={{ opacity: isInView ? 1 : 0, x: !isInView ? "-100%" : 0 }}
            transition={{
              type: "spring",
              duration: 1,
            }}
          >
            {t("title")}
          </motion.h2>
          <motion.p
            className="w-full max-w-md text-justify text-base text-[#757b8a]"
            id="about-caption"
            animate={{ opacity: isInView ? 1 : 0, x: !isInView ? "100%" : 0 }}
            transition={{
              type: "spring",
              duration: 1,
            }}
          >
            {t("caption")}
          </motion.p>
        </div>
        <div className="about-grid">
          <MainCard
            className="mainCard"
            style={{ gridArea: "main" }}
            id="main-card"
            animate={{ opacity: isInView ? 1 : 0, y: !isInView ? "100%" : 0 }}
            transition={{
              type: "spring",
              duration: 1,
              delay: 0.2,
            }}
          />
          <Card
            title={t("get-started-card.title")}
            desc={t("get-started-card.caption")}
            theme="secondary"
            style={{ gridArea: "getStarted" }}
            id="get-started-card"
            animate={{ opacity: isInView ? 1 : 0, y: !isInView ? "100%" : 0 }}
            transition={{
              type: "spring",
              duration: 1,
              delay: 0.3,
            }}
          />
          <Card
            title={t("lets-talk-card.title")}
            desc={t("lets-talk-card.caption")}
            theme="secondary"
            style={{ gridArea: "letsTalk" }}
            id="lets-talk-card"
            animate={{ opacity: isInView ? 1 : 0, y: !isInView ? "100%" : 0 }}
            transition={{
              type: "spring",
              duration: 1,
              delay: 0.3,
            }}
          />
          <Card
            title={t("get-started-now-card.title")}
            desc={t("get-started-now-card.caption")}
            theme="primary"
            style={{ gridArea: "getStartedNow" }}
            id="get-started-now-card"
            animate={{ opacity: isInView ? 1 : 0, y: !isInView ? "100%" : 0 }}
            transition={{
              type: "spring",
              duration: 1,
              delay: 0.3,
            }}
          />
        </div>
      </Container>
    </section>
  );
};
