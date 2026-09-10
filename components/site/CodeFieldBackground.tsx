"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/** Quiet code texture in the open spaces between public-site content.
 * One canvas, cached content bounds, and a short-lived response to movement.
 * The animation stops after the pointer rests and the response fades away. */
const SPACING = 56;
const RADIUS = 220;
const PUSH = 4;
const SETTLED = 0.03;
const HOLD_MS = 700;
const FADE_MS = 1800;
const BASE_SIZE = 14;
const SIZE_GAIN = 2;
const FONTS = Array.from({ length: SIZE_GAIN * 2 + 1 }, (_, i) =>
  `${BASE_SIZE + i / 2}px ui-monospace, SFMono-Regular, Menlo, "Liberation Mono", monospace`,
);
const CONTENT = "h1,h2,h3,h4,h5,h6,p,li,dt,dd,label,a,button,input,textarea,select,summary,[data-code-field-exclude]";
const smoothstep = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

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
const REST_OPACITY = 0.007;
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
  proximity: number;
  clearance: number;
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
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let tokens: Token[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let restOpacity = REST_OPACITY;
    let restRGB = [255, 255, 255];
    let litRGB = LIT.split(",").map(Number);
    let litStrength = 0.30;
    const media = window.matchMedia(INTERACTIVE);
    const site = canvas.closest('[data-site="public"]');
    let boundsStale = true;
    let lastMove = -Infinity;
    let previousFrame = 0;
    let disposed = false;
    const readPalette = () => {
      const styles = getComputedStyle(canvas);
      restOpacity = Number(styles.getPropertyValue("--site-field-rest-opacity").trim() || REST_OPACITY);
      restRGB = document.documentElement.getAttribute("data-public-theme") === "light" ? [23, 53, 44] : [255, 255, 255];
      litRGB = (styles.getPropertyValue("--site-field-lit").trim() || LIT).split(",").map(Number);
      litStrength = Number(styles.getPropertyValue("--site-field-strength").trim() || "0.30");
    };

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
            proximity: 0,
            clearance: 1,
          });
        }
      }
      boundsStale = true;
    }

    // Read content geometry only after layout/scroll changes, not pointer moves.
    // Cache a feathered exclusion factor per token; its padding includes the
    // glyph's width and small displacement, so strokes cannot cross the text.
    function measureContent() {
      if (!site) return;
      const boxes = Array.from(site.querySelectorAll(CONTENT))
        .filter((element) => !element.closest('[aria-hidden="true"],[hidden],.site-menu-outgoing-page') && getComputedStyle(element).visibility !== "hidden")
        .map((element) => element.getBoundingClientRect())
        .filter((box) => box.width > 0 && box.height > 0 && box.bottom > -44 && box.top < height + 44);
      for (const token of tokens) {
        let clearance = 1;
        for (const box of boxes) {
          const dx = Math.max(box.left - token.x, 0, token.x - box.right);
          const dy = Math.max(box.top - token.y, 0, token.y - box.bottom);
          clearance = Math.min(clearance, smoothstep((Math.hypot(dx, dy) - 20) / 24));
          if (clearance === 0) break;
        }
        token.clearance = clearance;
      }
      boundsStale = false;
    }

    /**
     * Largest distance any token still has to travel to reach its target,
     * recorded by the most recent `draw()`. This is what `tick()` stops on.
     */
    let maxDelta = 0;

    function draw(now = performance.now(), dt = 1 / 60) {
      if (!ctx) return;
      maxDelta = 0;
      ctx.clearRect(0, 0, width, height);
      if (reduced || !media.matches) return;
      if (boundsStale) measureContent();
      const activity = 1 - smoothstep((now - lastMove - HOLD_MS) / FADE_MS);
      const approach = 1 - Math.exp(-dt * 12);
      let fontIndex = 0;
      ctx.font = FONTS[fontIndex];
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
          const ease = smoothstep(f) * activity;
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

        // Include brightness/size in the stop condition. Leaving the field
        // fades the response out even after positional movement has settled.
        maxDelta = Math.max(maxDelta, Math.abs(lit - t.proximity) * 20);
        t.ox += (tx - t.ox) * approach;
        t.oy += (ty - t.oy) * approach;
        t.proximity += (lit - t.proximity) * approach;

        const proximity = t.proximity;
        const tint = Math.min(1, proximity * 3);
        const r = Math.round(restRGB[0] + (litRGB[0] - restRGB[0]) * tint);
        const g = Math.round(restRGB[1] + (litRGB[1] - restRGB[1]) * tint);
        const b = Math.round(restRGB[2] + (litRGB[2] - restRGB[2]) * tint);
        const opacity = (restOpacity + proximity * litStrength) * (0.8 + 0.2 * t.alpha) * t.clearance;
        if (opacity < 0.002) continue;
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
        // Prebuilt half-pixel font steps avoid creating font strings per frame.
        const nextFont = Math.round(proximity * SIZE_GAIN * 2);
        if (nextFont !== fontIndex) {
          fontIndex = nextFont;
          ctx.font = FONTS[fontIndex];
        }
        ctx.fillText(t.ch, t.x + t.ox, t.y + t.oy);
        ctx.globalAlpha = 1;
      }

    }

    function tick(now: number) {
      const dt = previousFrame ? Math.min(0.05, (now - previousFrame) / 1000) : 1 / 60;
      previousFrame = now;
      draw(now, dt);
      // Wait through the brief hold/fade, then sleep completely. Measuring
      // proximity as well as displacement prevents a half-finished fade.
      if (now >= lastMove + HOLD_MS + FADE_MS && maxDelta < SETTLED) {
        raf = 0;
        previousFrame = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function wake() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    readPalette();
    layout();
    draw();
    // Palette changes repaint once; no new perpetual loop or layout work.
    const themeObserver = new MutationObserver(() => { readPalette(); draw(); });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-public-theme"] });

    const invalidateBounds = () => { boundsStale = true; wake(); };
    const onPageArrival = (event: AnimationEvent) => {
      if (event.animationName === "site-page-menu-enter") invalidateBounds();
    };
    const onResize = () => { layout(); wake(); };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lastMove = performance.now();
      wake();
    };
    const onLeave = () => {
      // Fade in place instead of moving the focal point abruptly off screen.
      lastMove = Math.min(lastMove, performance.now() - HOLD_MS);
      wake();
    };
    let listening = false;
    function syncInteraction() {
      const enabled = !reduced && media.matches;
      if (enabled === listening) return;
      listening = enabled;
      if (enabled) {
        window.addEventListener("mousemove", onMove);
        window.addEventListener("scroll", invalidateBounds, { passive: true });
        document.addEventListener("mouseleave", onLeave);
      } else {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("scroll", invalidateBounds);
        document.removeEventListener("mouseleave", onLeave);
        lastMove = -Infinity;
      }
      invalidateBounds();
    }
    syncInteraction();
    media.addEventListener("change", syncInteraction);
    window.addEventListener("resize", onResize);
    site?.addEventListener("animationend", onPageArrival as EventListener);
    const resizeObserver = new ResizeObserver(invalidateBounds);
    if (site) resizeObserver.observe(site);
    document.fonts.ready.then(() => { if (!disposed) invalidateBounds(); });

    return () => {
      disposed = true;
      themeObserver.disconnect();
      resizeObserver.disconnect();
      media.removeEventListener("change", syncInteraction);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      site?.removeEventListener("animationend", onPageArrival as EventListener);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", invalidateBounds);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced, pathname]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="site-code-field pointer-events-none fixed inset-0 -z-10"
    />
  );
}
