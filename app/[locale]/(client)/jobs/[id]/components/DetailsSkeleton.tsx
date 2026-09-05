/**
 * The role page's loading placeholder — reskinned to match the real page (P3).
 *
 * It was a near-line-by-line tracing of the application form's every field, in
 * `bg-gray-500` slabs, which on this ground was a page of bright grey blocks
 * pretending to be content. A placeholder only has to hold the SHAPE of what is
 * coming: a title band, a paragraph, two panels, and one form block. Anything
 * more detailed is a second copy of the form's layout that silently goes stale
 * the moment a field moves.
 *
 * `white/6` bars, same weight as the site's hairlines. `animate-pulse` is CSS,
 * so the public tree's reduced-motion net already neutralises it.
 */
function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/6 ${className}`} />;
}

const DetailsSkeleton = () => {
  return (
    <div className="w-full" aria-hidden>
      <div className="px-6 pb-12 pt-40">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-center gap-3">
            <Bar className="size-3 rounded-full" />
            <Bar className="h-9 w-72 max-w-[70%]" />
          </div>
          <div className="space-y-2.5">
            <Bar className="h-4 w-full" />
            <Bar className="h-4 w-4/5" />
          </div>
          <div className="mt-6 flex gap-5">
            <Bar className="h-3.5 w-24" />
            <Bar className="h-3.5 w-28" />
          </div>
        </div>
      </div>

      <div className="px-6 pb-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6">
              <Bar className="mb-5 h-5 w-32" />
              <div className="space-y-3">
                <Bar className="h-3.5 w-full" />
                <Bar className="h-3.5 w-5/6" />
                <Bar className="h-3.5 w-4/6" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <Bar className="mb-6 h-6 w-44" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Bar className="h-3.5 w-24" />
                <Bar className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Bar className="mt-8 h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default DetailsSkeleton;
