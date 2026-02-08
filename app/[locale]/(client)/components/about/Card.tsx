"use client";
import { ArrowUpRight } from "lucide-react";
import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { motion } from "motion/react";

type Props = {
  title: string;
  desc: string;
  theme: "primary" | "secondary";
};

export const Card = ({
  title,
  desc,
  theme,
  className,
  ...props
}: Props & ComponentProps<typeof motion.div>) => {
  return (
    <motion.div
      {...props}
      className={twMerge(
        "group w-full flex min-h-46 flex-col justify-between p-6 rounded-xl transition-transform duration-400 ease-[cubic-bezier(0.42,1.75,0.55,1.2)]",
        "hover:-translate-y-2 hover:opacity-80 text-white",
        "h-full",
        `bg-${theme}`,
        theme == "primary" && "text-black",
        className,
      )}
    >
      <div className="desc mb-8 text-base font-normal leading-normal">
        {desc}
      </div>

      <div className="title-icon flex items-center justify-between text-2xl leading-[1.1]">
        <h2
          className={twMerge(
            "font-bold transition-transform group-hover:-translate-y-1 duration-300 ease-[cubic-bezier(0.42,1.75,0.55,1.2)]",
          )}
        >
          {title}
        </h2>

        <div className="icon self-end">
          <ArrowUpRight
            className={theme === "primary" ? "text-black" : "text-white"}
          />
        </div>
      </div>
    </motion.div>
  );
};
