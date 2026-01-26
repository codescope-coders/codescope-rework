import { cva, VariantProps } from "class-variance-authority";
import { ComponentProps } from "react";
export const layerVariants = cva(
  [
    "absolute top-0 left-0 w-full h-full to-transparent pointer-events-none",
    "transition-all duration-300 ease-out z-10",
  ],
  {
    variants: {
      variant: {
        default: "from-white",
        primary: "from-primary",
        dark: "from-black",
        secondary: "from-secondary",
      },
      direction: {
        top: "bg-gradient-to-t",
        bottom: "bg-gradient-to-b",
        left: "bg-gradient-to-l",
        right: "bg-gradient-to-r",
      },
      opacity: {
        0: "opacity-0",
        25: "opacity-25",
        50: "opacity-50",
        75: "opacity-75",
        100: "opacity-100",
      },
      blur: {
        none: "",
        sm: "backdrop-blur-sm",
        md: "backdrop-blur-md",
        lg: "backdrop-blur-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      direction: "bottom",
      opacity: 50,
      blur: "sm",
    },
  },
);

export const Layer = ({
  blur,
  direction,
  opacity,
  variant,
  className,
  ...props
}: VariantProps<typeof layerVariants> & ComponentProps<"div">) => {
  return (
    <div
      {...props}
      className={layerVariants({
        blur,
        direction,
        opacity,
        variant,
        className,
      })}
    ></div>
  );
  // "layer absolute top-0 left-0 w-full h-full z-2"
};
