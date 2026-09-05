/**
 * The list card's loading placeholder — reskinned to match the real card (P3).
 *
 * It deliberately does NOT use `components/ui/skeleton`: that primitive paints
 * `bg-accent`, a dashboard token that resolves to the light theme's value on
 * this ground and rendered as pale grey slabs — the loading state was the
 * loudest thing on the page. The bars here are `white/6`, the same weight as
 * the card's own hairlines, so a page mid-fetch reads as quiet rather than
 * broken. `animate-pulse` is a CSS animation, which the public tree's
 * reduced-motion safety net already neutralises.
 */
function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/6 ${className}`} />;
}

export default function JobCardSkeleton() {
  return (
    <li className="glass-card flex flex-col rounded-2xl p-6" aria-hidden>
      <div className="mb-4 flex flex-col items-start gap-3 border-b border-white/8 pb-4">
        <div className="flex w-full items-start justify-between gap-3">
          <Bar className="h-5 w-48" />
          <Bar className="mt-1 size-2.5 rounded-full" />
        </div>
        <Bar className="h-6 w-24 rounded-full" />
      </div>
      <div className="grow space-y-2">
        <Bar className="h-3.5 w-full" />
        <Bar className="h-3.5 w-5/6" />
        <Bar className="h-3.5 w-4/6" />
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex gap-4">
          <Bar className="h-3 w-20" />
          <Bar className="h-3 w-24" />
        </div>
        <Bar className="h-11 w-full rounded-xl" />
      </div>
    </li>
  );
}
