import { motion } from "motion/react";
import Image from "next/image";

export const Fly4allApplication = () => {
  return (
    <motion.div className="overflow-hidden pe-8 max-md:w-full max-md:flex-1 min-w-2xs">
      <motion.div
        className="relative"
        variants={{
          visible: { y: 0, opacity: 1, x: 0 },
          hidden: { y: 100, opacity: 0 },
        }}
        transition={{
          delay: 0.2,
          stiffness: 100,
        }}
      >
        <motion.div
          variants={{
            visible: { rotate: 0, y: 0, scale: 1 },
            hidden: { rotate: 45, y: "100%", scale: 0.3 },
          }}
          transition={{
            duration: 0.6,
          }}
          className="relative z-10"
        >
          <Image
            src={"/home/fly4all-application.png"}
            alt="fly4all mobile app"
            width={500}
            height={500}
            className="relative object-cover rounded-bl-2xl max-md:w-full z-10 origin-top duration-300 w-full h-auto"
          />
        </motion.div>
        <div
          className="w-full bottom-0 rounded-2xl left-0 z-0 bg-primary absolute"
          style={{ height: "calc(100% - 3.12rem)" }}
        ></div>
      </motion.div>
    </motion.div>
  );
};
