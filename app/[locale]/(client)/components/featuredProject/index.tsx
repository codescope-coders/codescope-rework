"use client";
import { Button } from "@/components/ui/button";
import { Fly4allApplication } from "./Fly4allApplication";
import { twMerge } from "tailwind-merge";
import { ArrowRight } from "lucide-react";
import Container from "@/components/Container";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useVariablesStore } from "@/stores/variables";

const VISIBLE_VARIANT = {
  x: 0,
  y: 0,
  opacity: 1,
};
const HIDDEN_VARIANT = {
  x: "-100%",
  y: 0,
  opacity: 0,
};

export const FeaturedProject = () => {
  const section = useRef(null);
  const { showContactUs } = useVariablesStore();
  const isInView = useInView(section, {
    margin: "0% 0px -60% 0px",
    once: true,
  });
  const t = useTranslations("home.featured-project");
  return (
    <motion.section
      className={twMerge("bg-white py-20")}
      id="tourscope"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      ref={section}
      transition={{
        staggerChildren: 0.1,
      }}
    >
      <Container className="container md:gap-20 gap-10 flex md:justify-between max-md:flex-col whitespace-break-spaces">
        <div className="left h-full md:max-w-150 text-black md:ps-20">
          <motion.h2
            className="sm:text-xl text-base font-bold mb-2.5"
            variants={{
              visible: VISIBLE_VARIANT,
              hidden: HIDDEN_VARIANT,
            }}
            transition={{
              stiffness: 100,
              duration: 0.5,
            }}
          >
            {t("label")}
          </motion.h2>
          <motion.h3
            className="md:text-6xl sm:text-5xl text-4xl mb-6 font-medium leading-[110%]"
            variants={{
              visible: VISIBLE_VARIANT,
              hidden: HIDDEN_VARIANT,
            }}
            transition={{
              stiffness: 100,
              duration: 0.5,
            }}
          >
            {t.rich("title", {
              strong: (chunks) => (
                <strong className="font-black">{chunks}</strong>
              ),
              i: (chunks) => <i>{chunks}</i>,
            })}
          </motion.h3>
          <motion.p
            className="mb-10 w-full md:max-w-100 text-neutral-60 leading-[160%] max-sm:text-sm"
            variants={{
              visible: VISIBLE_VARIANT,
              hidden: HIDDEN_VARIANT,
            }}
            transition={{
              stiffness: 100,
              duration: 0.5,
            }}
          >
            {t("caption")}
          </motion.p>
          <motion.div
            variants={{
              visible: VISIBLE_VARIANT,
              hidden: HIDDEN_VARIANT,
            }}
            transition={{
              stiffness: 100,
              duration: 0.5,
            }}
          >
            <Button
              onClick={showContactUs}
              className="button bg-primary w-full text-wrap h-[unset] hover:bg-primary hover:opacity-80 min-[400px]:h-fit min-[400px]:text-nowrap min-[400px]:w-fit text-white max-sm:whitespace-break-spaces"
            >
              <span>{t("button")}</span>
              <div className="icon flex items-center justify-center rtl:rotate-180">
                <ArrowRight width={16} />
              </div>
            </Button>
          </motion.div>
        </div>
        <Fly4allApplication />
      </Container>
    </motion.section>
  );
};
