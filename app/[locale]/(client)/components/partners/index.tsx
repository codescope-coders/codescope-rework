"use client";

import { motion } from "framer-motion";
import { Partner } from "./Partner";
import { useLocale } from "next-intl";

const logos = [
  "/home/partners/1.png",
  "/home/partners/2.png",
  "/home/partners/3.png",
  "/home/partners/5.png",
  "/home/partners/6.png",
  "/home/partners/7.png",
  "/home/partners/8.png",
  "/home/partners/9.png",
];

export const Partners = () => {
  const locale = useLocale();
  return (
    <section className="partners overflow-hidden bg-[#F5F5F5] py-24">
      <motion.div
        className="flex items-center gap-16 w-max"
        animate={{
          x: ["0%", locale == "en" ? "calc(-50% - 2rem)" : "calc(50% + 2rem)"],
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {[...logos, ...logos].map((logo, i) => (
          <Partner key={i} logo={logo} />
        ))}
      </motion.div>
    </section>
  );
};
