import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const skeletonVariants = cva("animate-pulse rounded-md", {
  variants: {
    variant: {
      primary: "bg-blue-500/10",
      secondary: "bg-purple-500/10",
      accent: "bg-emerald-500/10",
      light: "bg-gray-100/50",
      dark: "bg-gray-900/10",
      gray: "bg-gray-200/60",
    },
  },
  defaultVariants: {
    variant: "gray",
  },
});

interface SkeletonProps
  extends React.ComponentProps<"div">, VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Skeleton, skeletonVariants };
