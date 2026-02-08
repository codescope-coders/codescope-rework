import { cva, VariantProps } from "class-variance-authority";
import { ComponentProps } from "react";

const textareaVariants = cva(
  [
    "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input w-full min-w-0 rounded-md min-h-12 max-h-72 border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    "focus-visible:border-primary/90 focus-visible:ring-primary/20 focus-visible:ring-[2px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ],
  {
    variants: {
      variant: {
        default: "",
        success: "border-success focus-visible:ring-success/40",
        destructive:
          "border-red-500 focus-visible:ring-red-500/40 focus-visible:border-red-500/50",
      },
    },
  }
);

export const Textarea = ({
  className,
  variant,
  ...props
}: ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) => {
  return (
    <textarea
      className={textareaVariants({ variant, className })}
      {...props}
    ></textarea>
  );
};
