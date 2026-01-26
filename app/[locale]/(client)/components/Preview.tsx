"use client";
import Container from "@/components/Container";
import { useInView, motion } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export const Preview = () => {
  const section = useRef(null);
  const isInView = useInView(section, {
    once: true,
    margin: "0px 0px -60% 0px",
  });
  return (
    <motion.section
      ref={section}
      className="previewContainer bg-primary max-sm:min-h-auto max-md:min-h-100"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <Container className="relative">
        <motion.div
          className="sharp_line w-[99%] h-70 bg-secondary absolute top-2/4 z-0 -translate-y-2/4 left-2/4 -translate-x-2/4"
          style={{ clipPath: "polygon(0 28%, 100% 0, 100% 100%, 0 66%)" }}
          variants={{
            visible: { clipPath: "polygon(0 28%, 100% 0, 100% 100%, 0 66%)" },
            hidden: { clipPath: "polygon(0 28%, 0% 28%, 0% 66%, 0 66%)" },
          }}
          transition={{
            delay: 0.8,
          }}
        ></motion.div>
        <motion.div
          className="preview z-10 relative"
          variants={{
            visible: { x: 0, opacity: 1 },
            hidden: { x: "50%", opacity: 0 },
          }}
          transition={{
            type: "spring",
            stiffness: 100, // ↓ lower = slower
            damping: 20, // ↑ higher = less bounce
            mass: 1.2, // ↑ heavier = slower
          }}
        >
          <Image
            src={"/home/fly4all-preview.png"}
            alt="Preview image"
            width={10000}
            height={10000}
            className="w-full  -translate-y-20 lg:-translate-y-36 lg:w-3/4 mx-auto"
          />
        </motion.div>
      </Container>
    </motion.section>
  );
};
