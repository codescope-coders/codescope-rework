"use client";

import { useVariablesStore } from "@/stores/variables";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useEffect } from "react";

const splitWords = (text: string) => text.split(" ");

const container = (stagger: number): Variants => ({
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
    },
  },
});

const word: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 100,
      mass: 0.5,
    },
  },
};

export const ApplicationSentMessage = () => {
  const { isMessageVisible, hideMessage } = useVariablesStore();

  useEffect(() => {
    if (!isMessageVisible) return;

    const timer = setTimeout(hideMessage, 3000);
    return () => clearTimeout(timer);
  }, [isMessageVisible, hideMessage]);

  useEffect(() => {
    if (isMessageVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMessageVisible]);

  const titleWords = splitWords(
    "Your application has been submitted successfully.",
  );

  const captionWords = splitWords(
    "Our team will review it and contact you if you're shortlisted. Thank you for applying and good luck!",
  );

  return (
    <AnimatePresence>
      {isMessageVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 120,
          }}
          className="fixed inset-0 bg-primary text-white flex flex-col items-center justify-center z-100"
        >
          <motion.h2
            variants={container(0.12)}
            initial="hidden"
            animate="visible"
            className="text-4xl font-bold mb-4 text-center flex flex-wrap justify-center gap-x-2"
          >
            {titleWords.map((wordText, i) => (
              <motion.span key={i} variants={word}>
                {wordText}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p
            variants={container(0.02)}
            initial="hidden"
            animate="visible"
            className="text-lg md:max-w-md leading-tight mx-auto text-center flex flex-wrap justify-center gap-x-1"
          >
            {captionWords.map((wordText, i) => (
              <motion.span key={i} variants={word}>
                {wordText}
              </motion.span>
            ))}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
