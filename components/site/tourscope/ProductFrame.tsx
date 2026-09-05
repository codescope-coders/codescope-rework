import Image from "next/image";
import type { ReactNode } from "react";
import { tsPurple } from "@/lib/colors";

/**
 * The window every product view on this page sits inside.
 *
 * ── Why a shared component rather than per-call-site markup ──────────────────
 * The views come from two different products (the traveler marketplace and the
 * agency console), two locales, and two form factors. Dropped onto the page as
 * six loose panels they read as six unrelated pictures. One frame — same radius,
 * same hairline border, same ambient glow — is what makes them read as one
 * system, and it is the difference between "screens pasted onto a site" and
 * "a product being shown".
 *
 * The chrome bar is CODE-DRAWN, never captured: a real browser's chrome would
 * carry the dev environment's URL, its tab strip, and its scrollbars. The pill
 * holds a short CAPTION, deliberately not a URL — a fake address bar invites
 * the reader to try the address, and a real one is a localhost leak.
 *
 * ── Two content modes ───────────────────────────────────────────────────────
 * `children` (what this page uses now) mounts a CODED slice — real DOM built in
 * the site's own dark palette, from `ProductSlices.tsx`. `src` mounts a captured
 * `<Image>`, which is what the page used until the light-mode screenshots were
 * pulled: they were bright rectangles on a near-black page, and no amount of
 * framing reconciles a white product surface with this ground. The image mode is
 * kept because a future shot taken in the product's own dark theme would need
 * it, and it costs nothing to leave.
 *
 * A coded slice carries no `alt`: it is `aria-hidden` in its own right (the
 * section copy beside it carries the meaning), so there is nothing to describe.
 *
 * ── Reduced motion ──────────────────────────────────────────────────────────
 * Nothing here animates. The frame is static by construction; the single quiet
 * entrance belongs to the `FadeIn` the caller wraps it in, which already renders
 * final state under `prefers-reduced-motion`.
 */

interface FrameShellProps {
  /**
   * Short label for the chrome bar's pill — what this screen IS, not where it
   * lives. Omitted on the `device` variant, which has no chrome bar.
   */
  caption?: string;
  /**
   * `browser` draws the chrome bar; `device` is a rounded slab for a phone-shaped
   * view. Radius, border and glow are shared.
   */
  variant?: "browser" | "device";
  /** The purple ambient wash behind the frame. On by default. */
  glow?: boolean;
  className?: string;
}

interface CodedContent {
  /** A coded product slice. Mutually exclusive with `src`. */
  children: ReactNode;
}

interface ImageContent {
  src: string;
  /** Meaningful description of the screen. Comes from `messages`, never hardcoded. */
  alt: string;
  /** Intrinsic pixel size of the file. Ignored in crop mode (which uses `fill`). */
  width: number;
  height: number;
  /** Required: these are 3200px-wide files and a wrong `sizes` ships all of it. */
  sizes: string;
  /**
   * CSS-only crop. `aspect` (width ÷ height) sets a fixed window and the image
   * covers it; `position` chooses which part of the image that window lands on.
   *
   * This exists so a shot can be trimmed without a second copy of the file on
   * disk: re-cropping later is a one-number edit, not a re-export.
   */
  crop?: { aspect: number; position?: string };
  priority?: boolean;
}

type ProductFrameProps = FrameShellProps & (CodedContent | ImageContent);

function isCoded(props: ProductFrameProps): props is FrameShellProps & CodedContent {
  return "children" in props;
}

export function ProductFrame(props: ProductFrameProps) {
  const { caption, variant = "browser", glow = true, className = "" } = props;

  let media: ReactNode;

  if (isCoded(props)) {
    media = props.children;
  } else {
    // `priority` and `loading` are mutually exclusive on next/image — passing both
    // is a runtime warning and the lazy hint silently wins.
    const loadingProps = props.priority
      ? { priority: true }
      : ({ loading: "lazy" } as const);

    media = props.crop ? (
      // Crop mode: a fixed-aspect window the image covers. `fill` is what makes
      // the window, not the file, decide the frame's shape.
      <div className="relative w-full" style={{ aspectRatio: String(props.crop.aspect) }}>
        <Image
          src={props.src}
          alt={props.alt}
          fill
          sizes={props.sizes}
          className="object-cover"
          style={{ objectPosition: props.crop.position ?? "center" }}
          {...loadingProps}
        />
      </div>
    ) : (
      <Image
        src={props.src}
        alt={props.alt}
        width={props.width}
        height={props.height}
        sizes={props.sizes}
        className="block h-auto w-full"
        {...loadingProps}
      />
    );
  }

  const rounding = variant === "device" ? "rounded-[1.75rem] p-1.5" : "rounded-xl";

  return (
    <div className={`relative ${className}`}>
      {/* Ambient wash. One soft radial rather than a stack of drop-shadows —
          layered shadows on a near-black ground turn into grey mud. It sits
          before the frame in the DOM, so the frame paints over it without
          needing a stacking context. */}
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 sm:-inset-10"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 45%, ${tsPurple(0.16)}, transparent 70%)`,
          }}
        />
      )}

      {/* A plain div, not <figure>: the visible caption lives inside the
          aria-hidden chrome bar, and the content is either an `alt`-bearing
          image or an aria-hidden coded slice — so a figure would be an
          unlabeled landmark buying nothing. */}
      <div
        className={`relative overflow-hidden border border-white/[0.08] bg-cs-panel ${rounding}`}
      >
        {variant === "browser" && (
          /* Chrome, not content: it names no page and carries no link, so it is
             hidden from assistive tech entirely. */
          <div
            aria-hidden
            className="flex min-w-0 items-center gap-2 border-b border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 sm:px-4"
          >
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="block h-2 w-2 rounded-full bg-white/15" />
              <span className="block h-2 w-2 rounded-full bg-white/15" />
              <span className="block h-2 w-2 rounded-full bg-white/15" />
            </span>
            {caption && (
              /* `w-0 grow`, NOT `min-w-0 flex-1`. `truncate` sets
                 `white-space: nowrap`, which makes this span's MIN-CONTENT the
                 full caption string — and a flex container's min-content is the
                 sum of its items' contributions, so the bar refused to shrink
                 below ~370px however narrow the frame got. In the B2B card that
                 propagated all the way up: the card is a grid item sized by its
                 content, so at 390px the whole two-sides grid blew 74px past the
                 viewport and the page scrolled sideways. A definite `w-0` basis
                 contributes nothing, and `grow` still fills the bar. */
              <span className="ms-2 w-0 grow truncate rounded-md border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[11px] leading-tight text-zinc-400 sm:ms-3">
                {caption}
              </span>
            )}
          </div>
        )}

        <div className={variant === "device" ? "overflow-hidden rounded-[1.35rem]" : ""}>
          {media}
        </div>
      </div>
    </div>
  );
}
