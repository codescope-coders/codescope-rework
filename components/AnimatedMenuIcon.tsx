import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const lineVariants: Variants = {
  closed: {
    x: 0,
  },
  hover: (offset: number) => ({
    x: [0, offset, 0],
    transition: {
      duration: 0.35,
      ease: [0.42, 0, 0.58, 1],
    },
  }),
};

type AnimatedMenuIconProps = {
  className?: string;
};

export const AnimatedMenuIcon = ({ className = "" }: AnimatedMenuIconProps) => {
  return (
    <motion.div
      className={`flex flex-col gap-1.5 ${className}`}
      initial="closed"
      animate="closed"
      whileHover="hover"
    >
      <motion.span
        className="h-0.5 w-5 bg-current rounded-full"
        variants={lineVariants}
        custom={3}
      />
      <motion.span
        className="h-0.5 w-5 bg-current rounded-full"
        variants={lineVariants}
        custom={2}
      />
      <motion.span
        className="h-0.5 w-5 bg-current rounded-full"
        variants={lineVariants}
        custom={3}
      />
    </motion.div>
  );
};
