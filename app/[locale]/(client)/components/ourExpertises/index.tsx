"use client";
import Container from "@/components/Container";
import { Expertise } from "./Expertise";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useRef } from "react";
import { useInView, motion } from "motion/react";
import { useTranslations } from "next-intl";

const title = "Our Expertise, Your Advantage";
const subtitle = "Your Partner in Innovative Solutions";

export const OurExpertises = () => {
  const section = useRef(null);
  const isInView = useInView(section, {
    margin: "0% 0px -60% 0px",
    once: true,
  });
  const t = useTranslations("home.our-expertises");

  return (
    <section
      className="bg-background md:py-30 py-10"
      id="services"
      ref={section}
    >
      <Container>
        <div className="mb-10">
          <h2 className="pb-6 md:text-5xl text-3xl leading-[131%] font-normal">
            <motion.span
              className="font-black inline-block lg:text-6xl md:text-5xl text-4xl"
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={{
                visible: {
                  transition: { staggerChildren: 0.08 },
                },
              }}
            >
              {t("title")
                .split(" ")
                .map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-2"
                    variants={{
                      hidden: { y: "50%", opacity: 0 },
                      visible: { y: 0, opacity: 1 },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
            </motion.span>
            <br />
            <motion.span
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={{
                visible: {
                  transition: { staggerChildren: 0.08, delayChildren: 0.2 },
                },
              }}
            >
              {t("subtitle")
                .split(" ")
                .map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-2"
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: { y: 0, opacity: 1 },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
            </motion.span>
          </h2>
          <motion.p
            className="font-medium sm:text-base text-sm leading-[160%] text-neutral-60 max-w-md w-full"
            animate={{ x: isInView ? 0 : "-100%", opacity: isInView ? 1 : 0 }}
            transition={{ duration: 0.3, stiffness: 80 }}
          >
            {t("caption")}
          </motion.p>
        </div>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: { staggerChildren: 0.08 },
            },
          }}
        >
          <Carousel opts={{ align: "center" }}>
            <CarouselContent>
              <CarouselItem className="lg:basis-[calc(33.33333333%-1rem)] md:basis-[calc(50%-1rem)] basis-full not-last:me-6 flex items-center justify-center">
                <Expertise
                  variants={{
                    hidden: { y: "50%" },
                    visible: { y: 0 },
                  }}
                  transition={{ type: "spring", stiffness: 100, duration: 0.2 }}
                  heading={t.rich("services.app-development.title", {
                    br: () => <br />,
                  })}
                  desc={t("services.app-development.desc")}
                  image={"/home/features/1.webp"}
                />
              </CarouselItem>
              <CarouselItem className="lg:basis-[calc(33.33333333%-1rem)] md:basis-[calc(50%-1rem)] basis-full not-last:me-6 flex items-center justify-center">
                <Expertise
                  variants={{
                    hidden: { y: "50%" },
                    visible: { y: 0 },
                  }}
                  transition={{ type: "spring", stiffness: 100, duration: 0.2 }}
                  heading={t.rich("services.web-development.title", {
                    br: () => <br />,
                  })}
                  desc={t("services.web-development.desc")}
                  image={"/home/features/2.webp"}
                />
              </CarouselItem>
              <CarouselItem className="lg:basis-[calc(33.33333333%-1rem)] md:basis-[calc(50%-1rem)] basis-full not-last:me-6 flex items-center justify-center">
                <Expertise
                  variants={{
                    hidden: { y: "50%" },
                    visible: { y: 0 },
                  }}
                  transition={{ type: "spring", stiffness: 100, duration: 0.2 }}
                  heading={t.rich("services.management-systems.title", {
                    br: () => <br />,
                  })}
                  desc={t("services.management-systems.desc")}
                  image={"/home/features/3.webp"}
                />
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </motion.div>
      </Container>
    </section>
  );
};
