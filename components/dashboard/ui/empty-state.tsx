import { cn } from "@/lib/utils";

export function EmptyState({
  children,
  className,
  icon,
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "surface-raised flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center text-[13px] leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {icon && (
        <span className="grid size-12 place-items-center rounded-full bg-neutral-100 text-neutral-400">
          {icon}
        </span>
      )}
      <div className="max-w-sm">{children}</div>
    </div>
  );
}
