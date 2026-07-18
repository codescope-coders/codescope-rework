import { cn } from "@/lib/utils";

// whitelabel-console table: a neutral-50 card framing a bg-background panel with
// hairline row separators (last row flush) and a soft row hover.
export function TableWrap({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-neutral-50 p-2",
        className,
      )}
    >
      <div className="scrollbar-thin overflow-x-auto rounded-xl border border-border bg-background">
        {children}
      </div>
    </div>
  );
}

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <table
      className={cn(
        "w-full border-collapse text-[13px] [&_tbody_tr]:transition-colors [&_tbody_tr:hover_td]:bg-muted/40 [&_tbody_tr:last-child_td]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

export function Th({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-11 whitespace-nowrap border-b border-border px-4 text-start align-middle font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "border-b border-border px-4 py-3 align-middle text-foreground",
        className,
      )}
      {...props}
    />
  );
}
