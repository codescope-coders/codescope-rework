import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "soft"
  | "green"
  | "warning"
  | "background"
  | "gray";

const badgeVariants = cva(
  "inline-flex items-center justify-center h-fit rounded-md border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-invalid-color text-white [a&]:hover:bg-invalid-color/90 focus-visible:ring-invalid-color/20 dark:focus-visible:ring-invalid-color/40 dark:bg-invalid-color/60",
        outline:
          "text-primary border-primary [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success:
          "text-success border-transparent bg-success/12 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        soft: "text-primary bg-primary/25 border-transparent [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        green:
          "text-green-color-foreground bg-green-color border-transparent [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        warning:
          "text-pending-color-foreground bg-pending-color border-transparent [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        pending:
          "text-yellow-800 bg-yellow-100 border-transparent [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        background: "bg-background border border-input-border",
        gray: "bg-gray-500 text-white",
      },
      size: {
        default: "px-2 py-1 text-xs",
        sm: "px-1 py-0.5 text-[10px]",
        lg: "px-3 py-2.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
