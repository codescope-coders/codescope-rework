"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import Image from "next/image";
import { PRODUCT_NAV_HREF } from "@/lib/nav-product-pill";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { pauseSmoothScroll, resumeSmoothScroll } from "@/lib/lenis";
import { DURATION, EASE, EASE_OUT, EASE_TRAVEL, STAGGER } from "@/lib/motion";
import { tealGlow } from "@/lib/colors";
import { StarfieldButton } from "@/components/site/StarfieldButton";

type NavItem = { href: string; label: string };

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Opacity only — no `scale`. The panel is a full-screen `backdrop-blur-xl`
// surface, and scaling it forces the browser to re-sample the blur of
// everything behind it on every frame of the open and close: the most expensive
// thing on the page, animated, on the device least able to afford it. The
// children's y-stagger already reads as the menu assembling.
const overlay = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: DURATION.fast,
      ease: EASE_OUT,
      // ⚠️ NOT `when: "beforeChildren"`. That held every row back until the
      // ground had finished arriving, so the menu did nothing at all for its
      // first 220ms and then started — which reads as lag rather than as
      // layering. The rows now begin while the ground is still coming up, and
      // `delayChildren` is only the beat that keeps them from racing it.
      delayChildren: STAGGER.base,
      staggerChildren: STAGGER.base,
    },
  },
  // A dismissal should be quicker than an arrival, and it is one fade: the
  // ground carries the rows out with it. Staggering the rows on the way out
  // too was tried and put half a second between the tap and an empty screen.
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE_OUT } },
};

// Mostly a FADE, with just enough lift to carry a direction (founder, mobile
// review 2026-09-09). A 16px throw over 0.22s read as rows being flung into
// place; 8px over `DURATION.base` reads as rows arriving.
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
  exit: { opacity: 0, transition: { duration: DURATION.instant, ease: EASE_OUT } },
};

/**
 * The teal hairline that sweeps the panel once, on open.
 *
 * The menu's one piece of ornament, and it is borrowed rather than invented:
 * the desktop nav marks its current page with a teal hairline, and
 * `StarfieldButton` runs a light around a CTA's rim. A light travelling a
 * surface is already this site's way of saying "this is live". Here it reads as
 * the panel being DRAWN rather than merely appearing, and it is timed to reach
 * the foot of the list at about the moment the last row settles: the rows start
 * at `STAGGER.base` and step by the same, so the seventh begins at 0.42s and
 * finishes at 0.77s — against this sweep's `DURATION.slower`. Re-time one and
 * re-time both, or the light lands on a list still assembling.
 *
 * ⚠️ Transform and opacity ONLY, and on a layer of its own OUTSIDE the panel.
 * The panel is a full-screen `backdrop-blur-xl` surface, so anything that
 * changes its geometry — a `scale`, a `clip-path`, an animated `height` — makes
 * the browser re-sample the blur of the entire page behind it on every frame,
 * on the device least able to afford it. That is the same reason the overlay
 * below fades rather than scales. A 1px line translating inside its own
 * `overflow-hidden` box costs a composite and nothing else.
 *
 * Keeping the layer OUT of the panel is the second half of that: the panel is
 * `overflow-y-auto`, and a transformed child travelling its full height would
 * be counted in its scrollable overflow — the menu would gain a screen of empty
 * scroll for the duration of the animation.
 */
const sweep = {
  hidden: { y: "0%", opacity: 0 },
  show: {
    y: "100%",
    // Struck, held, then gone — a light that simply faded in and out would read
    // as a glow rather than as something travelling.
    opacity: [0, 1, 0.9, 0],
    transition: { duration: DURATION.slower, ease: EASE_TRAVEL, times: [0, 0.1, 0.72, 1] },
  },
};

/**
 * The trigger's glyph: three bars that fold into a cross.
 *
 * It replaces a cross-fade between two icon-font glyphs, which could only ever
 * CUT from one shape to the other — the outgoing glyph rotated out while the
 * incoming one rotated in, and at 150ms that reads as a flicker rather than as
 * a change of state. Bars this component owns can actually travel: the outer
 * two converge on the middle's centre line and rotate into the X while the
 * middle one gets out of their way.
 *
 * The geometry is measured, not eyeballed. Three 1.5px bars on a 6.25px pitch
 * span 14px, centred in a 20px box puts their tops at 3 / 9.25 / 15.5 and their
 * centres at 3.75 / 10 / 16.25 — so the outer two each travel exactly 6.25px to
 * land on the middle's centre. The 20px box inside the button's `p-2` keeps the
 * trigger's hit area at the 36x36 it was with the icon font, so the header's
 * layout does not move.
 *
 * `bg-current` inherits the button's own `text-zinc-400 hover:text-white`, so
 * the hover treatment is unchanged from the icon it replaces. Transform and
 * opacity only.
 */
function MenuGlyph({ open, reduced }: { open: boolean; reduced: boolean }) {
  const spring = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 500, damping: 32, mass: 0.7 };
  const fade = reduced ? { duration: 0 } : { duration: DURATION.instant, ease: EASE_OUT };
  const bar = "absolute inset-x-0 block h-[1.5px] rounded-full bg-current";

  return (
    <span aria-hidden="true" className="relative block h-5 w-5">
      <motion.span
        className={bar}
        style={{ top: 3 }}
        animate={open ? { y: 6.25, rotate: 45 } : { y: 0, rotate: 0 }}
        transition={spring}
      />
      <motion.span
        className={bar}
        style={{ top: 9.25 }}
        // Shrinking as it goes, so it reads as being absorbed into the cross
        // rather than as a bar that blinked out.
        animate={open ? { opacity: 0, scaleX: 0.3 } : { opacity: 1, scaleX: 1 }}
        transition={fade}
      />
      <motion.span
        className={bar}
        style={{ top: 15.5 }}
        animate={open ? { y: -6.25, rotate: -45 } : { y: 0, rotate: 0 }}
        transition={spring}
      />
    </span>
  );
}

export default function MobileMenu({ items, ctaLabel, loginLabel }: { items: NavItem[]; ctaLabel: string; loginLabel: string }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotionSafe();
  const t = useTranslations("Nav");
  // Only the product pill reads this — the plain rows carry no active state in
  // this menu, and adding one to them is a separate design decision.
  const pathname = usePathname();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    // Lock the page behind the overlay. Both halves are needed: Lenis animates
    // the window itself and ignores `overflow: hidden`, and under reduced
    // motion Lenis is never mounted so only the CSS lock applies.
    pauseSmoothScroll();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Captured now: by cleanup time the ref may already point elsewhere.
    const trigger = triggerRef.current;

    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      // Trap: the overlay covers the page, so Tab must not walk into the
      // content behind it.
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      resumeSmoothScroll();
      // Send focus back where it came from, so closing with Escape doesn't
      // drop the caret at the top of the document.
      trigger?.focus();
    };
  }, [open]);

  const navLinks = items.map((navItem) => {
    // ⚠️ NO product pill here, unlike the desktop nav (founder, mobile review
    // 2026-09-09). The purple chip was the one framed object in a column of
    // plain words, and at this type size it read as a button that had fallen
    // into a list of links rather than as "this one is the product". The
    // wordmark alone already says which row it is. The desktop pill in
    // `NavbarShell` is unchanged — there it sits among other chips, not among
    // 24px words.
    if (navItem.href === PRODUCT_NAV_HREF) {
      const isActive = pathname === navItem.href;
      return (
        <Link
          key={navItem.href}
          href={navItem.href}
          onClick={() => setOpen(false)}
          aria-current={isActive ? "page" : undefined}
          className="group flex py-5 border-b border-white/5 last:border-none"
        >
          {/* The mark is centred in a box exactly the height of a neighbour's
              LINE (`h-8` is `text-2xl`'s 2rem), so every row in the list is
              72px and the pitch does not stutter on the one row that carries an
              image instead of text. Measured, not guessed — re-measure if the
              row's type size changes. */}
          <span className="flex h-8 items-center">
            <Image
              src="/Branding/tourscope.svg"
              alt={navItem.label}
              width={507}
              height={54}
              className="h-[15px] w-auto brightness-0 invert transition-[filter] duration-300 group-hover:brightness-100 group-hover:invert-0"
            />
          </span>
        </Link>
      );
    }

    return (
      <Link
        key={navItem.href}
        href={navItem.href}
        onClick={() => setOpen(false)}
        className="block text-zinc-300 hover:text-white py-5 border-b border-white/5 text-2xl font-medium transition-colors last:border-none"
      >
        {navItem.label}
      </Link>
    );
  });

  const cta = (
    // Same target as the desktop nav CTA in NavbarShell — the two must not
    // drift, or the same button means two different things per viewport.
    // The wrapper renders nothing on a coarse pointer, so on the phones this
    // menu exists for it is exactly the Link it always was.
    <StarfieldButton variant="primary" className="w-full">
      <Link
        href="/get-started"
        onClick={() => setOpen(false)}
        className="w-full text-center py-3.5 px-6 bg-[#0a1c1a] text-white text-sm font-semibold rounded-full hover:bg-[#0f2a27] transition-colors block"
      >
        {ctaLabel}
      </Link>
    </StarfieldButton>
  );

  // Login — same port as the desktop link (see NavbarShell): quiet, under the
  // CTA, closing the menu on tap like every other item.
  const loginCta = (
    <Link
      href="/login"
      onClick={() => setOpen(false)}
      className="w-full text-center py-3 px-6 text-sm font-medium text-zinc-400 hover:text-white transition-colors block"
    >
      {loginLabel}
    </Link>
  );

  const panelBody = (
    // ⚠️ `max-w-2xl`, not the site's usual `max-w-7xl`. This panel serves
    // tablets now that the nav switches at `lg`, and at 1023px an unconstrained
    // column gave a 975px-wide "Request a demo" button under six links strung
    // across the full width — a phone layout stretched, not a tablet one. 672px
    // is wider than any phone, so nothing below `sm` changes at all; above it
    // the column centres and keeps a readable measure.
    <nav className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-1">
      {reduced
        ? navLinks.map((link) => <div key={link.key}>{link}</div>)
        : navLinks.map((link) => (
            <motion.div key={link.key} variants={item}>
              {link}
            </motion.div>
          ))}
      {reduced ? (
        <div className="mt-6">{cta}{loginCta}</div>
      ) : (
        <motion.div variants={item} className="mt-6">
          {cta}
          {loginCta}
        </motion.div>
      )}
    </nav>
  );

  // ⚠️ `h-[calc(100dvh-4rem)]`, NOT `bottom-0`.
  //
  // This panel is `position: fixed`, but it is NOT laid out against the
  // viewport: `NavbarShell`'s `<header>` always declares a `backdrop-filter`
  // (at `blur(0px)` when idle, so the property can interpolate on scroll
  // instead of snapping), and any `backdrop-filter` other than `none` makes an
  // element the containing block for its fixed descendants. So `top-16` and
  // `bottom-0` both resolved against the header's own 64px box and the panel
  // computed to `height: 0` — open, focus-trapped, body scroll locked, and
  // invisible. Measured on both this build and the design source it was ported
  // from: `getBoundingClientRect().height === 0` at every width below `lg`,
  // i.e. the mobile menu could never be seen on a phone.
  //
  // Pinning the height sidesteps the containing block entirely while leaving
  // the design untouched: `top-16` already puts the panel's top edge at the
  // header's bottom (the header sits at viewport y=0), and `inset-x-0` is
  // correct because the header is full-bleed. 4rem is the same `h-16` the
  // header and `top-16` already assume — one number, three call sites, so it
  // stays consistent if the bar is ever resized.
  //
  // The geometry is factored out because the sweep layer below has to occupy
  // exactly the same box. Two hand-written copies of a comment this long is how
  // one of them quietly stops matching the other.
  const panelBoxClassName = "lg:hidden fixed top-16 inset-x-0 h-[calc(100dvh-4rem)]";
  const panelClassName = `${panelBoxClassName} bg-zinc-950/98 backdrop-blur-xl z-40 overflow-y-auto`;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="lg:hidden inline-flex items-center justify-center p-2 text-zinc-400 hover:text-white transition-colors"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {/* One glyph in both states — see `MenuGlyph`. Under reduced motion its
            bars land in place with a zero-length transition, so the button
            still SHOWS a cross while open rather than freezing on a
            hamburger. */}
        <MenuGlyph open={open} reduced={reduced} />
      </button>

      {reduced ? (
        // Reduced motion: the panel is simply there, or not.
        open && (
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={t("menuLabel")}
            data-lenis-prevent
            className={panelClassName}
          >
            {panelBody}
          </div>
        )
      ) : (
        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-menu"
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label={t("menuLabel")}
              // The panel outlives `open` by the length of its exit animation.
              // The focus trap is torn down the instant `open` flips, so for
              // those ~180ms a Tab or a screen-reader cursor could walk into a
              // closing dialog that still covers the page. `inert` takes it out
              // of the accessibility tree and the tab order for exactly that
              // window.
              inert={!open}
              // Lenis leaves elements marked this way alone, so a long menu can
              // still be scrolled natively while the page behind it is pinned.
              data-lenis-prevent
              variants={overlay}
              initial="hidden"
              animate="show"
              exit="exit"
              className={panelClassName}
            >
              {panelBody}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* The sweep — OVER the panel, and outside it.
          ⚠️ `z-[41]`, one above the panel's own `z-40`, and rendered after it.
          Either alone would do it; both are here because the first cut relied
          on DOM order, sat before the panel in the tree, and was painted over
          by an opaque surface — a light animating perfectly, invisibly, with
          nothing to say why.
          `overflow-hidden` keeps the travelling line inside the panel's box.
          No `AnimatePresence`: unmounting the instant `open` flips is what we
          want — a light sweeping the panel as it CLOSES would be ornament
          arguing with a dismissal. */}
      {!reduced && open && (
        <span
          aria-hidden="true"
          className={`${panelBoxClassName} z-[41] overflow-hidden pointer-events-none`}
        >
          <motion.span
            className="absolute inset-x-0 top-0 block h-full"
            variants={sweep}
            initial="hidden"
            animate="show"
          >
            <span
              className="absolute inset-x-0 top-0 block h-px bg-cs-teal"
              style={{ boxShadow: `0 0 14px 1px ${tealGlow(0.55)}` }}
            />
          </motion.span>
        </span>
      )}
    </>
  );
}
