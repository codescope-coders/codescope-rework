import { ComponentProps } from "react";

function Container({
  children,
  className,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
} & ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`container mx-auto px-4 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

export default Container;
