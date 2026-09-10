"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * The site's background: a field of code tokens that parts around the cursor.
 *
 * Replaces the 64px rule-grid this page used to sit on. Same rhythm, same
 * near-invisible weight at rest — the tokens sit on the grid the lines used to
 * draw, so nothing about the page's proportions changed. What is new is that
 * the field reacts: tokens inside a radius of the pointer are pushed outward
 * and lit in brand teal, and settle back when it leaves.
 *
 * ── ⚠️ Why this is a canvas and not ~350 elements ──────────────────────────
 * The technique is usually written one element per dot, each with its own
 * transform springs. That is affordable inside a 400px card and is not
 * affordable here: this layer is `fixed inset-0` on EVERY marketing page, so at
 * the grid's own 64px pitch a 1440x900 viewport holds ~350 tokens and a 4K
 * display ~1,700. As DOM that is thousands of spring subscriptions re-rendering
 * under a smooth-scroll loop that is already asking for every frame. One canvas
 * draws the whole field in a single pass with no reconciliation, and the token
 * count stops being an architectural decision.
 *
 * ── Why it idles at zero cost ─────────────────────────────────────────────
 * The loop is not always running. At rest the field is drawn ONCE and the rAF
 * is cancelled; a pointer move starts it, and it stops itself again a frame
 * after every token is within a tenth of a pixel of ITS OWN TARGET — which,
 * with the pointer parked over the page, is a displaced position rather than
 * home. A reader who is not moving the mouse pays for nothing.
 *
 * ⚠️ That distinction is the whole fix. The test used to be "is every offset
 * near zero", i.e. distance from HOME, and it was additionally gated on the
 * pointer having left the document. So a pointer merely resting anywhere on the
 * page held ~30 tokens at a large permanent offset, the test could never come
 * back true, and the loop ran at 60fps for as long as the tab was open —
 * measured at 69,660 token draws per second. Only the pointer-off-page half of
 * the condition ever stopped it, which is exactly the case the test covered.
 */

/**
 * Much denser than the 64px rule-grid this replaced. A grid of lines can be
 * sparse because the lines connect; loose glyphs cannot, so at anything near
 * the old pitch the tokens read as scattered rather than as a field. 34px is
 * ~3.5x the token count of the grid it replaced and is where the eye starts
 * joining them into a surface.
 */
const SPACING = 34;
/** How far from the pointer a token starts reacting. */
const RADIUS = 190;
/** Peak displacement, in px, for a token directly under the pointer. */
const PUSH = 15;
/** Per-frame approach to the target offset. Higher is snappier. */
const EASE = 0.11;
/**
 * Below this, the field is treated as settled and the loop stops. Measured as
 * the largest remaining distance from any token to its TARGET offset — not from
 * zero, which would never be reached while the pointer is on the page.
 */
const SETTLED = 0.1;
/**
 * Radius of the subtractive hole punched at the pointer.
 *
 * Deliberately well under `RADIUS`: the field parts and lights across the full
 * 190px, and only dissolves in the middle 105. That surviving lit ring is the
 * effect — let `HOLE` approach `RADIUS` and the lighting has nothing left to
 * happen on, so it reads as a bug rather than as a scope.
 */
const HOLE = 105;

const FONT = '11px ui-monospace, SFMono-Regular, Menlo, "Liberation Mono", monospace';

/**
 * Real tokens rather than loose punctuation. A grid of stray `;` and `{` reads
 * as noise; `=>`, `!==` and `</>` read as code at a glance, which is the whole
 * point of the substitution.
 */
const TOKENS = [
  "{", "}", "(", ")", "[", "]", "<", ">", "/", ";", "=", "+", "*", "&", "|",
  "=>", "()", "{}", "[]", "//", "&&", "||", "!==", "===", "::", "++", "</>",
  "0", "1", "$", "_", "?.", "??",
];

/** Base ink — the old grid line's weight, so the field is texture, not content. */
const REST = "rgba(255, 255, 255, 0.055)";
/** Teal, as rgb channels — the lit state near the pointer. */
const LIT = "8, 186, 168";

/**
 * The same gate the old grid's glow used: a coarse pointer can never hover, so
 * on a phone the field is drawn once and no listener is attached.
 */
const INTERACTIVE = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

interface Token {
  x: number;
  y: number;
  ch: string;
  /** Per-token ink variation, so the field has grain instead of looking printed. */
  alpha: number;
  ox: number;
  oy: number;
}

/**
 * Deterministic per-cell pseudo-random. A real `Math.random()` would re-shuffle
 * every token on every resize, so dragging a window edge would visibly reprint
 * the page.
 */
function hash(col: number, row: number): number {
  const n = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function CodeFieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let tokens: Token[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    // Off-screen until the pointer arrives, so nothing is lit on first paint.
    const mouse = { x: -9999, y: -9999 };

    function layout() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      tokens = [];
      // Half a cell in from the edge, so the field reads as a continuing
      // pattern rather than one that starts at the viewport corner.
      for (let y = SPACING / 2, row = 0; y < height + SPACING; y += SPACING, row++) {
        for (let x = SPACING / 2, col = 0; x < width + SPACING; x += SPACING, col++) {
          const r = hash(col, row);
          tokens.push({
            x,
            y,
            ch: TOKENS[Math.floor(r * TOKENS.length)] ?? "/",
            alpha: 0.55 + hash(row, col) * 0.75,
            ox: 0,
            oy: 0,
          });
        }
      }
    }

    /**
     * Largest distance any token still has to travel to reach its target,
     * recorded by the most recent `draw()`. This is what `tick()` stops on.
     */
    let maxDelta = 0;

    function draw() {
      if (!ctx) return;
      maxDelta = 0;
      ctx.clearRect(0, 0, width, height);
      ctx.font = FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const t of tokens) {
        const dx = t.x - mouse.x;
        const dy = t.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        let tx = 0;
        let ty = 0;
        let lit = 0;
        if (dist < RADIUS) {
          // ⚠️ Smoothstep, not the linear `1 - d/R` this shipped with. A linear
          // falloff is a CONE — its derivative jumps at the boundary, and the
          // eye reads that jump as a ring around the pointer. The founder's
          // words for the composite were "not smooth, sharp". Smoothstep is
          // flat at both ends, so the light now breathes out to nothing.
          const f = 1 - dist / RADIUS;
          const ease = f * f * (3 - 2 * f);
          const force = ease * PUSH;
          const angle = Math.atan2(dy, dx);
          tx = Math.cos(angle) * force;
          ty = Math.sin(angle) * force;
          lit = ease;
        }

        // Convergence is measured BEFORE the easing step, so it is the gap the
        // frame is about to close rather than the one it just left behind.
        const dox = Math.abs(tx - t.ox);
        const doy = Math.abs(ty - t.oy);
        if (dox > maxDelta) maxDelta = dox;
        if (doy > maxDelta) maxDelta = doy;

        t.ox += (tx - t.ox) * EASE;
        t.oy += (ty - t.oy) * EASE;

        if (lit > 0.01) {
          // Teal fades in over the resting white rather than replacing it, so a
          // token brightens on approach instead of changing colour abruptly.
          // The grain's weight is deliberately compressed here (a quarter of
          // its resting swing): full grain made adjacent lit tokens differ by
          // 2x in brightness, which in motion reads as SPARKLE — pinpoints
          // popping — rather than as a glow moving over a field.
          // Halved from 0.34 on the founder's third pass over this effect
          // ("that shine ... remove it or reduce it"): at this weight the teal
          // is a presence you notice when looking FOR it, not a lamp you
          // carry around the page.
          ctx.fillStyle = `rgba(${LIT}, ${(0.03 + lit * 0.17) * (0.75 + 0.25 * t.alpha)})`;
        } else {
          ctx.fillStyle = REST;
          ctx.globalAlpha = t.alpha;
        }
        ctx.fillText(t.ch, t.x + t.ox, t.y + t.oy);
        ctx.globalAlpha = 1;
      }

      // ── The hole ────────────────────────────────────────────────────────
      // ⚠️ `destination-out`, NOT a fill in the page ground colour. The
      // reference this borrows from can paint its own ground because its canvas
      // IS the bottom layer; ours is transparent and, inside the hero, now has
      // a lit shader behind it — painting #09090b there would stamp a dark disc
      // over the beam. Erasing removes the tokens and nothing else, so it
      // composites correctly over whatever happens to be underneath.
      if (mouse.x !== -9999) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        const g = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          HOLE,
        );
        // Four stops tracing an S-curve. The old three had corners at 0.55
        // and at the rim, and the rim corner sat exactly where the lit ring
        // peaks — the two edges compounded into a visible bright annulus
        // around the pointer.
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.45, "rgba(0,0,0,0.78)");
        g.addColorStop(0.75, "rgba(0,0,0,0.3)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(mouse.x - HOLE, mouse.y - HOLE, HOLE * 2, HOLE * 2);
        ctx.restore();
      }
    }

    function tick() {
      draw();
      // Every token is now within `SETTLED` of where it was heading, so the next
      // frame would be indistinguishable from this one — stop until the pointer
      // moves again and `wake()` restarts it. No `mouse.x === -9999` clause:
      // "the pointer left" is not what makes the field static, and requiring it
      // is what kept the loop alive under a resting cursor.
      if (maxDelta < SETTLED) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function wake() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    layout();
    draw();

    const onResize = () => {
      layout();
      draw();
    };
    window.addEventListener("resize", onResize);

    // Reduced motion, or a device that cannot hover: the field is painted once
    // and never touched again. It is texture either way.
    const interactive = !reduced && window.matchMedia(INTERACTIVE).matches;
    let onMove: ((e: MouseEvent) => void) | undefined;
    let onLeave: (() => void) | undefined;

    if (interactive) {
      onMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        wake();
      };
      onLeave = () => {
        mouse.x = -9999;
        mouse.y = -9999;
        wake();
      };
      window.addEventListener("mousemove", onMove);
      document.addEventListener("mouseleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (onMove) window.removeEventListener("mousemove", onMove);
      if (onLeave) document.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="site-code-field pointer-events-none fixed inset-0 -z-10"
    />
  );
}
