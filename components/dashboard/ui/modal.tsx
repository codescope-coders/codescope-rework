"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import useDashboardTheme from "@/stores/dashboardTheme";

/**
 * Theme-aware modal. Radix portals to <body> (outside the shell's [data-theme]
 * subtree), so we stamp the current dashboard theme onto the content element —
 * otherwise the modal would fall back to the public-site light tokens.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const theme = useDashboardTheme((s) => s.theme);
  const width =
    size === "sm" ? "max-w-[400px]" : size === "lg" ? "max-w-[640px]" : "max-w-[480px]";

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          data-theme={theme}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-overlay text-foreground shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0",
            width,
            className,
          )}
        >
          {(title || description) && (
            <div className="flex items-start justify-between gap-3 px-5 pb-1 pt-5">
              <div>
                {title && (
                  <Dialog.Title className="text-base font-bold text-foreground">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </Dialog.Close>
            </div>
          )}
          <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
