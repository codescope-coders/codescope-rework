"use client";

import { motion } from "framer-motion";
import { Client } from "./Client";
import { useLocale } from "next-intl";

const logos = [
  "/home/clients/1.png",
  "/home/clients/2.png",
  "/home/clients/3.png",
  "/home/clients/4.png",
  "/home/clients/5.png",
  "/home/clients/6.png",
  "/home/clients/7.png",
  "/home/clients/8.png",
  "/home/clients/9.png",
];

export const Clients = () => {
  const locale = useLocale();
  return (
    <div className="clients overflow-hidden bg-[#F5F5F5] py-24">
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
          <Client key={i} logo={logo} />
        ))}
      </motion.div>
    </div>
  );
};
