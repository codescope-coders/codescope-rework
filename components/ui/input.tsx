import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { Check, XIcon } from "lucide-react";
import * as React from "react";

export const InputVariants = cva(
  [
    // Base styles
    "flex w-full min-w-0 font-medium text-base outline-none transition-[color,box-shadow]",
    "border-input-border bg-bg-input text-foreground",
    "placeholder:text-muted-foreground",
    "selection:bg-primary selection:text-primary-foreground",

    // Dark mode
    "dark:bg-input/30",

    // File input styles
    // "file:inline-flex file:border-0 file:bg-transparent file:font-medium file:text-foreground",

    // Disabled state
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

    // Focus state
    "focus-visible:border-primary/80",

    // Invalid state
    "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
    "dark:aria-invalid:ring-destructive/40",
  ],
  {
    variants: {
      variant: {
        default: "rounded-md border",
        bordered: "border border-input-border",
        underline: "border-b border-b-input-border !rounded-none shadow-none",
        light:
          "rounded-md !bg-light-color dark:focus-visible:ring-primary/40 focus-visible:ring-black/10",

        background:
          "rounded-md border border-input-border !bg-background dark:focus-visible:ring-primary/40",
      },
      size: {
        default: "text-[1rem] h-12 px-4 py-2 md:text-sm text-[1rem]",
        sm: "text-sm py-2 px-3 h-10",
        lg: "text-[1rem] py-6 px-5 h-16 ",
      },
      shape: {
        default: "rounded-md",
        pilled: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  },
);

export const Input = ({
  className,
  type,
  error,
  icon,
  variant,
  size,
  shape,
  success,
  iconPosition = "start",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof InputVariants> & {
    error?: (string | undefined | null)[];
    icon?: React.ReactNode;
    success?: string[];
    iconPosition?: "start" | "end";
  }) => {
  const validErrors = error?.filter((e): e is string => !!e);
  return (
    <>
      <div className={clsx("flex flex-col", className)}>
        <div className="input relative">
          {icon && React.isValidElement(icon) && (
            <div
              className={clsx(
                "icon absolute top-2/4 -translate-y-2/4 start-2.5 text-muted-foreground pointer-events-none",
                {},
              )}
            >
              {React.cloneElement(
                icon as React.ReactElement<{ className?: string }>,
                {
                  className: cn(
                    (icon.props as { className?: string }).className,
                    "w-[0.9rem] text-subtitle-color",
                  ),
                },
              )}
            </div>
          )}
          <input
            type={type}
            data-slot="input"
            className={cn(InputVariants({ variant, size, shape, className }), {
              "ps-8!": icon && iconPosition == "start",
              "border-invalid-color ltr:pr-8! selection:bg-invalid-color/80 rtl:pl-8! focus-visible:ring-invalid-color/30 focus-visible:border-invalid-color":
                validErrors && validErrors.length > 0,
              "border-success-color selection:bg-success-color/80 ltr:pr-8! rtl:pl-8! focus-visible:ring-success-color/30 focus-visible:border-success-color":
                success,
            })}
            {...props}
          />

          {success && (
            <div className="error-icon absolute top-2/4 ltr:right-3 rtl:left-3 -translate-y-[46%] pointer-events-none">
              <Check />
            </div>
          )}
        </div>
        {validErrors && validErrors.length > 0 && (
          <div className="errors mt-1 flex flex-col gap-1">
            {validErrors.map((error, i: number) => {
              return (
                <span
                  className="error text-invalid-color font-medium text-sm first-letter:uppercase inline-block"
                  key={i}
                >
                  {error}
                </span>
              );
            })}
          </div>
        )}
        {success && success.length > 0 && (
          <div className="success mt-1 flex flex-col gap-1">
            {success.map((success, i: number) => {
              return (
                <span
                  className="success text-success-color font-medium text-sm first-letter:uppercase inline-block"
                  key={i}
                >
                  {success}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
