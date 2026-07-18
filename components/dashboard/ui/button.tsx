import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Geist-style buttons mirrored from whitelabel-console: rounded-lg, flat (no
// glow), springy press (active:translate-y-px). Variant/size keys preserved so
// every existing call site stays unchanged.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent font-medium outline-none transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        subtle: "bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border-border bg-background text-foreground hover:bg-neutral-100",
        ghost: "text-foreground hover:bg-neutral-100",
        danger:
          "bg-destructive-500/10 text-destructive-600 hover:bg-destructive-500/20",
        "danger-solid": "bg-destructive-500 text-white hover:bg-destructive-600",
        success: "bg-success-500/10 text-success-700 hover:bg-success-500/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-9 px-3.5 text-sm",
        lg: "h-10 px-5 text-sm",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
