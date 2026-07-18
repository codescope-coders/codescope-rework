import * as React from "react";
import { cn } from "@/lib/utils";

export const controlClass =
  "h-9 w-full rounded-md border border-border bg-overlay px-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary disabled:opacity-60";

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label?: React.ReactNode;
  children: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
          {label}
        </span>
      )}
      {children}
      {hint && (
        <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(controlClass, "h-auto min-h-[76px] resize-y py-2", className)}
      {...props}
    />
  );
}

export function NativeSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select className={cn(controlClass, "pe-8", className)} {...props}>
      {children}
    </select>
  );
}
