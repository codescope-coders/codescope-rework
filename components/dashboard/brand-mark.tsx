"use client";

import { useBranding } from "@/hooks/useBranding";
import { cn } from "@/lib/utils";

/** The company logomark — uploaded image if set, else the short-text chip. */
export function BrandMark({
  size = 34,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const { data } = useBranding();
  const b = data?.payload;
  const logoUrl = b?.logoUrl;
  const logoText = b?.logoText || "CS";

  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={logoUrl}
        alt=""
        style={{ width: size, height: size }}
        className={cn("shrink-0 rounded-[26%] object-cover", className)}
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      className={cn(
        "grid shrink-0 place-items-center rounded-[26%] bg-primary font-extrabold text-primary-foreground",
        className,
      )}
      aria-hidden
    >
      {logoText}
    </span>
  );
}
