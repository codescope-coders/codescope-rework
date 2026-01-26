import { Layer } from "@/components/Layer";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ComponentProps, ReactNode } from "react";
import { motion } from "motion/react";

type Props = {
  heading: ReactNode;
  desc: string;
  image: string;
};

export const Expertise = ({
  heading,
  desc,
  image,
  className,
  ...props
}: Props & ComponentProps<typeof motion.div>) => {
  return (
    <motion.div
      {...props}
      className={cn(
        "relative h-125 rounded-xl text-white overflow-hidden group",
        className,
      )}
    >
      <div className="bg absolute top-0 left-0 w-full h-full z-0">
        <Image
          src={image}
          alt="bg-image"
          width={500}
          height={500}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div className="content relative z-3 flex items-end h-full group-hover:bg-primary/80 duration-400 px-3 py-5">
        <Layer
          variant={"dark"}
          direction={"top"}
          className="group-hover:opacity-0"
        />
        <h2 className="text-[2.5rem] rtl:leading-snug z-20 font-black! leading-[105%] text-center uppercase absolute top-1/2 group-hover:top-6 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:text-[1.625rem] group-hover:translate-y-0 w-full duration-200 ease-out">
          {heading}
        </h2>
        <p className="leading-[110%] text-2xl font-normal translate-y-full opacity-0 text-start group-hover:opacity-100 group-hover:translate-y-0 duration-300 ease-out">
          {desc}
        </p>
      </div>
    </motion.div>
  );
};
