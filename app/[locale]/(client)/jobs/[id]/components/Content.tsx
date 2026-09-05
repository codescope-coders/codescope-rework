"use client";
import { timeAgo } from "@/helpers/date";
import { useGetJobById } from "@/hooks/useJobs";
import { FadeIn } from "@/components/site/FadeIn";
import { HeroBackground } from "@/components/site/HeroBackground";
import clsx from "clsx";
import { ClockIcon, MapPinIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { JOB_TYPE_AR } from "../../components/Content";
import { ApplicationForm } from "./ApplicationForm";
import DetailsSkeleton from "./DetailsSkeleton";

/**
 * A single role — reskinned into the public design system (P3).
 *
 * Data wiring is untouched (`useGetJobById` on the route param, the pending
 * gate, the form rendered only once the role has loaded). What changed is the
 * frame: a hero band with the site's ambient background, the zinc text ramp,
 * hairline section rules, and requirements / responsibilities as REAL lists.
 *
 * ⚠️ Those two blocks previously rendered bare `<li>` elements with no `<ul>`
 * around them — invalid markup that a screen reader announces as loose text,
 * and the reason they carried a hand-rolled `ms-6` indent instead of list
 * semantics. Their headings were `<h1>`s on a page that already had one.
 */
export const Content = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isPending } = useGetJobById(id);
  const job = data?.payload;

  if (isPending) {
    return (
      <section>
        <DetailsSkeleton />
      </section>
    );
  }

  return (
    <section>
      <div className="relative overflow-hidden px-6 pb-12 pt-40">
        <HeroBackground />
        <div className="relative mx-auto max-w-4xl">
          <FadeIn>
            <div className="mb-4 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <h1 className="flex items-center gap-3 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                <span
                  aria-hidden
                  className={clsx("inline-block size-3 shrink-0 rounded-full border", {
                    "border-white/15 bg-white/8": job?.status == "CLOSED",
                    "border-cs-teal/50 bg-cs-teal/40": job?.status == "AVAILABLE",
                  })}
                />
                {job?.position}
              </h1>
              {job?.type && (
                <span className="shrink-0 rounded-full border border-white/8 bg-white/3 px-3.5 py-1 text-xs font-medium text-zinc-300">
                  {JOB_TYPE_AR[job.type]}
                </span>
              )}
            </div>
            <p className="max-w-[62ch] leading-relaxed text-zinc-300">
              {job?.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <ClockIcon width={15} />
                {timeAgo(job?.createdAt as string)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPinIcon width={15} />
                {job?.location}
              </span>
            </div>
          </FadeIn>
        </div>
      </div>

      {Boolean(job?.requirements?.length || job?.responsibilities?.length) && (
        <div className="px-6 pb-16">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {job?.requirements && job.requirements.length > 0 && (
              <FadeIn>
                <div className="glass-card h-full rounded-2xl p-6">
                  <h2 className="mb-4 text-lg font-semibold text-white">
                    المتطلبات:
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {job.requirements.map((r, i: number) => (
                      <li key={i} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-2 size-1 shrink-0 rounded-full bg-cs-teal/70"
                        />
                        <span className="text-sm leading-relaxed text-zinc-300">
                          {r}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            )}
            {job?.responsibilities && job.responsibilities.length > 0 && (
              <FadeIn delay={0.08}>
                <div className="glass-card h-full rounded-2xl p-6">
                  <h2 className="mb-4 text-lg font-semibold text-white">
                    المسؤوليات:
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {job.responsibilities.map((r, i: number) => (
                      <li key={i} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-2 size-1 shrink-0 rounded-full bg-cs-teal/70"
                        />
                        <span className="text-sm leading-relaxed text-zinc-300">
                          {r}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      )}

      <ApplicationForm />
    </section>
  );
};
