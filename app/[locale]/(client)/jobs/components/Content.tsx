"use client";
import { timeAgo } from "@/helpers/date";
import { useGetJobs } from "@/hooks/useJobs";
import { FadeIn } from "@/components/site/FadeIn";
import clsx from "clsx";
import { BriefcaseIcon, MapPinIcon, TimerIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import JobCardSkeleton from "./JobSkeleton";

/**
 * The careers list — reskinned into the public design system (P3), translated
 * (P8).
 *
 * ⚠️ Every piece of DATA WIRING here is unchanged: the `useGetJobs` query, the
 * six-at-a-time pagination, the IntersectionObserver that loads the next page,
 * and the CLOSED-role pointer lock. Only the surface and the strings moved.
 *
 * FURNITURE is translated; job DATA is not. A role's position, description and
 * location are whatever the operator typed into the careers dashboard, so they
 * render verbatim with `dir="auto"` — direction travels with the CONTENT, not
 * with the route, which is what lets an Arabic role title sit correctly on the
 * English page and an English one on the Arabic page. Nothing here carries a
 * hardcoded `dir`: the furniture follows the document, and the document is
 * right in both locales now.
 */

const ITEMS_PER_PAGE = 6;

const GRID =
  "grid gap-4 grid-cols-[repeat(auto-fill,minmax(100%,1fr))] md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))]";

/**
 * Employment type, localized. Shared with the role page (which imports it from
 * here, as it did the Arabic-only map this replaces).
 *
 * `t.has` rather than a bare `t(...)`: the key is built from a database enum
 * value, and next-intl THROWS on a missing message. The old lookup was a plain
 * object index that yielded `undefined` and rendered nothing, so a value added
 * to the `job_type` enum before its translation landed used to be a blank tag —
 * now it would be a thrown error inside render, i.e. a blank page. Falling back
 * to the raw enum value keeps the failure the size it was.
 */
export function useJobTypeLabel() {
  const t = useTranslations("Jobs");
  return (type?: string | null): string => {
    if (!type) return "";
    const key = `types.${type}`;
    return t.has(key) ? t(key) : type;
  };
}

export const Content = () => {
  const t = useTranslations("Jobs");
  const locale = useLocale() as "en" | "ar";
  const jobTypeLabel = useJobTypeLabel();
  const { data, isPending } = useGetJobs();
  const observerTarget = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalJobs = data?.payload?.length || 0;
  const displayedJobs =
    data?.payload?.slice(0, currentPage * ITEMS_PER_PAGE) || [];
  const hasMore = displayedJobs.length < totalJobs;

  const loadMore = useCallback(() => {
    if (hasMore && !isPending) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore, isPending]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore]);

  // ── Empty state ──
  // Deliberate rather than apologetic: an icon plate in the site's teal, the
  // two sentences, and a real way to reach us anyway. "No roles" is the most
  // common state a careers page is in, so it gets designed, not defaulted.
  if (!isPending && totalJobs === 0) {
    return (
      <FadeIn>
        <div className="glass-card mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cs-teal/20 bg-cs-teal/10">
            <BriefcaseIcon className="text-cs-teal" width={24} />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-semibold text-white">
              {t("emptyTitle")}
            </h2>
            <p className="max-w-[38ch] text-sm leading-relaxed text-zinc-400">
              {t("emptyBody")}
            </p>
          </div>
          <a
            href={`mailto:${t("emptyCta")}`}
            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:border-cs-teal/40 hover:bg-cs-teal/10"
          >
            {t("emptyCta")}
          </a>
        </div>
      </FadeIn>
    );
  }

  return (
    <>
      <ul className={GRID}>
        {isPending &&
          currentPage === 1 &&
          Array.from({ length: 3 }).map((_, i: number) => {
            return <JobCardSkeleton key={i} />;
          })}
        {displayedJobs?.map((job, i) => (
          <FadeIn
            as="li"
            key={i}
            delay={(i % ITEMS_PER_PAGE) * 0.06}
            className={clsx("h-full", {
              "pointer-events-none opacity-60": job.status == "CLOSED",
            })}
          >
            <article className="glass-card group flex h-full flex-col rounded-2xl p-6 transition-colors duration-300 hover:border-cs-teal/25">
              <div className="mb-4 flex flex-col items-start gap-3 border-b border-white/8 pb-4">
                <div className="flex w-full items-start justify-between gap-3">
                  <h2
                    dir="auto"
                    className="text-lg font-semibold leading-snug text-white"
                  >
                    {job?.position}
                  </h2>
                  {/* The status is a coloured dot, and a closed card is
                      additionally dimmed and unclickable — all three are
                      VISUAL. `sr-only` gives the same fact a name, so a screen
                      reader reaches a dead card knowing why it is dead instead
                      of discovering it by trying. `sr-only` is absolutely
                      positioned, so it adds no third flex item. */}
                  <span className="sr-only">
                    {job?.status == "CLOSED"
                      ? t("statusClosed")
                      : t("statusAvailable")}
                  </span>
                  <span
                    aria-hidden
                    className={clsx(
                      "mt-2 size-2.5 shrink-0 rounded-full border",
                      {
                        "border-cs-teal/50 bg-cs-teal/40":
                          job?.status == "AVAILABLE",
                        "border-white/15 bg-white/8": job?.status == "CLOSED",
                      },
                    )}
                  />
                </div>
                <span className="rounded-full border border-white/8 bg-white/3 px-3 py-1 text-xs font-medium text-zinc-400">
                  {jobTypeLabel(job?.type)}
                </span>
              </div>

              <p
                dir="auto"
                className="grow text-sm leading-relaxed text-zinc-400"
              >
                {job?.description}
              </p>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <TimerIcon width={14} />
                    {timeAgo(job?.createdAt, locale)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon width={14} />
                    <span dir="auto">{job?.location}</span>
                  </span>
                </div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-cs-teal text-sm font-semibold text-white transition-colors duration-200 hover:bg-cs-teal-hover active:scale-[0.99]"
                >
                  {t("apply")}
                </Link>
              </div>
            </article>
          </FadeIn>
        ))}
      </ul>

      {hasMore && !isPending && (
        <div
          ref={observerTarget}
          className="mt-6 flex h-20 items-center justify-center"
        >
          <div className="text-sm text-zinc-500">{t("loadingMore")}</div>
        </div>
      )}

      {isPending && currentPage > 1 && (
        <ul className={`${GRID} mt-4`}>
          {Array.from({ length: 3 }).map((_, i: number) => (
            <JobCardSkeleton key={i} />
          ))}
        </ul>
      )}
    </>
  );
};
