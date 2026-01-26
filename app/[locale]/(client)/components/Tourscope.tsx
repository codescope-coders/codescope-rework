"use client";

import { Button } from "@/components/ui/button";
// import ArrowRight from "@/assets/icons/arrow-right.svg";
import Container from "@/components/Container";
import { useRef } from "react";
import { useInView, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useVariablesStore } from "@/stores/variables";

export const Tourscope = () => {
  const { showContactUs } = useVariablesStore();
  const section = useRef(null);
  const isInView = useInView(section, {
    once: true,
    margin: "0px 0px -60% 0px",
  });
  const t = useTranslations("home.tourscope");
  return (
    <motion.section
      className="tourscope py-40 lg:py-60 text-center text-white bg-[#262626]"
      id="tourscope"
      ref={section}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{
        staggerChildren: 0.1,
        delay: 0.2,
        delayChildren: 0.1,
      }}
    >
      <Container>
        <motion.div
          className="title text-accent mb-6"
          variants={{
            visible: { y: 0, opacity: 1 },
            hidden: {
              y: 100,
              opacity: 0,
            },
          }}
          transition={{
            stiffness: 80,
          }}
        >
          <h2 className="text-5xl rtl:leading-snug">
            {t.rich("title", {
              strong: (chunks) => (
                <strong className="font-bold text-6xl italic">{chunks}</strong>
              ),
              br: () => <br />,
            })}
          </h2>
        </motion.div>
        <motion.p
          className="mb-10 w-full mx-auto leading-[160%] max-w-4xl"
          variants={{
            visible: { y: 0, opacity: 1 },
            hidden: {
              y: 100,
              opacity: 0,
            },
          }}
          transition={{
            stiffness: 80,
          }}
        >
          {t("caption")}
        </motion.p>
        <motion.div
          variants={{
            visible: { y: 0, opacity: 1 },
            hidden: {
              y: 100,
              opacity: 0,
            },
          }}
          transition={{
            stiffness: 80,
          }}
        >
          <Button
            onClick={showContactUs}
            className="button animatedEl bg-primary w-full py-4 text-lg text-wrap h-[unset] hover:bg-primary hover:opacity-80 min-[400px]:h-fit min-[400px]:text-nowrap min-[400px]:w-fit text-white"
          >
            <span>{t("button")}</span>
            {/* <div className="icon flex items-center justify-center rtl:rotate-180">
            <ArrowRight style={{ width: "auto", height: "auto" }} />
          </div> */}
          </Button>
        </motion.div>
      </Container>
    </motion.section>
  );
};
