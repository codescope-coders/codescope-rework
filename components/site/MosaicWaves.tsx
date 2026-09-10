"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * Mosaic Waves — a halftone grid of small squares whose brightness is a slow
 * noise field drifting through it, built for the Advanced pricing card.
 *
 * The reference is React Bits Pro's component of the same name, which is
 * licence-gated; the founder supplied a captured render and its parameter
 * panel, and this reproduces the look from those: dot pitch ~5px, square
 * cells, soft blobs of light crossing the field, gamma-shaped ramp, near-black
 * ground. Colours are ours — the TourScope purple ramp rather than the
 * reference's blue — per the founder's spec ("with tourscope colors").
 *
 * ── How it stays cheap ─────────────────────────────────────────────────────
 * The obvious build — one fillRect per dot per frame — is ~11,000 rects a
 * frame on a card this size. Instead the field is computed at ONE TEXEL PER
 * DOT into a small offscreen canvas (~80x140), scaled up with bilinear
 * smoothing, and clipped by a static dot-mask canvas via `destination-in`.
 * Three draw calls a frame, whatever the card's size; the JS cost is filling
 * ~11k ImageData texels, which is two lattice-noise samples each.
 *
 * Lifecycle discipline is the globe's: IntersectionObserver stops the loop
 * off-screen, reduced motion paints ONE frame and never loops, DPR capped at
 * 2, fail-soft on a missing context.
 */

/** Dot lattice pitch and cell size, CSS px — read off the reference capture. */
const PITCH = 5;
const CELL = 2.6;
/** Noise scales (per texel) and drift (texels/second) for the two octaves. */
const SCALE_1 = 0.045;
const SCALE_2 = 0.085;
const DRIFT_1X = 0.9;
const DRIFT_1Y = 0.45;
const DRIFT_2X = -0.55;
const DRIFT_2Y = 0.75;
/** Contrast window: field values below the floor are black, the ramp spans up
 *  to the ceiling. Tuned so most of the field rests dark with a few blobs lit,
 *  like the reference — not a wall of colour. */
const FLOOR = 0.36;
const CEIL = 0.86;
const GAMMA = 2.2;

/** The TourScope purple ramp: transparent -> deep purple -> #6f00ff ->
 *  #8b33ff -> near-white lavender. Stops as [v, r, g, b, a]. */
const STOPS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0.0, 24, 8, 64, 0],
  [0.35, 74, 10, 168, 140],
  [0.6, 111, 0, 255, 210],
  [0.8, 139, 51, 255, 235],
  [1.0, 232, 221, 255, 255],
];

/** Deterministic lattice permutation — the same hash family the globe and the
 *  token field use. NOT Math.random(): resize must not reshuffle the field. */
function hash(a: number, b: number): number {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

const PERM = new Uint8Array(512);
for (let i = 0; i < 256; i++) PERM[i] = PERM[i + 256] = Math.floor(hash(7, i) * 256);

/** Value noise on a wrapped 256 lattice, smoothstep-interpolated, 0..1. */
function vnoise(x: number, y: number): number {
  const xw = ((x % 256) + 256) % 256;
  const yw = ((y % 256) + 256) % 256;
  const xi = xw | 0;
  const yi = yw | 0;
  const xf = xw - xi;
  const yf = yw - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = PERM[xi + PERM[yi]];
  const b = PERM[xi + 1 + PERM[yi]];
  const c = PERM[xi + PERM[yi + 1]];
  const d = PERM[xi + 1 + PERM[yi + 1]];
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) / 255;
}

/** The 256-entry colour LUT, built once: gamma first, then the stop ramp. */
const LUT = new Uint8ClampedArray(256 * 4);
for (let i = 0; i < 256; i++) {
  const g = Math.pow(i / 255, GAMMA);
  let s = 1;
  while (s < STOPS.length - 1 && STOPS[s][0] < g) s++;
  const [v0, r0, g0, b0, a0] = STOPS[s - 1];
  const [v1, r1, g1, b1, a1] = STOPS[s];
  const t = Math.min(1, Math.max(0, (g - v0) / (v1 - v0 || 1)));
  LUT[i * 4] = r0 + (r1 - r0) * t;
  LUT[i * 4 + 1] = g0 + (g1 - g0) * t;
  LUT[i * 4 + 2] = b0 + (b1 - b0) * t;
  LUT[i * 4 + 3] = a0 + (a1 - a0) * t;
}

export function MosaicWaves({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const touch = window.matchMedia("(pointer: coarse)").matches;
    const frameInterval = touch ? 1000 / 30 : 0;
    let raf = 0;
    let elapsed = 0;
    let last = 0;
    let width = 0;
    let height = 0;
    let gw = 0;
    let gh = 0;
    let field: HTMLCanvasElement | null = null;
    let fieldCtx: CanvasRenderingContext2D | null = null;
    let image: ImageData | null = null;
    let mask: HTMLCanvasElement | null = null;

    function layout(): boolean {
      if (!canvas || !ctx) return false;
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (cssW < 2 || cssH < 2) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
      width = Math.floor(cssW * dpr);
      height = Math.floor(cssH * dpr);
      canvas.width = width;
      canvas.height = height;

      gw = Math.max(2, Math.round(cssW / PITCH));
      gh = Math.max(2, Math.round(cssH / PITCH));
      field = document.createElement("canvas");
      field.width = gw;
      field.height = gh;
      fieldCtx = field.getContext("2d");
      image = fieldCtx ? fieldCtx.createImageData(gw, gh) : null;

      // The dot mask: one static canvas of squares, drawn once. Alpha is all
      // that matters — `destination-in` keeps the field only where these are.
      mask = document.createElement("canvas");
      mask.width = width;
      mask.height = height;
      const mctx = mask.getContext("2d");
      if (mctx) {
        mctx.scale(dpr, dpr);
        mctx.fillStyle = "#fff";
        for (let y = PITCH / 2; y < cssH; y += PITCH) {
          for (let x = PITCH / 2; x < cssW; x += PITCH) {
            mctx.fillRect(x - CELL / 2, y - CELL / 2, CELL, CELL);
          }
        }
      }
      return true;
    }

    function draw() {
      if (!ctx || !fieldCtx || !image || !field || !mask) return;
      const d = image.data;
      const t = elapsed;
      let i = 0;
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const n1 = vnoise(x * SCALE_1 + t * DRIFT_1X * SCALE_1 * 6, y * SCALE_1 + t * DRIFT_1Y * SCALE_1 * 6);
          const n2 = vnoise(x * SCALE_2 + t * DRIFT_2X * SCALE_2 * 6, y * SCALE_2 + t * DRIFT_2Y * SCALE_2 * 6);
          const n = n1 * 0.62 + n2 * 0.38;
          let v = (n - FLOOR) / (CEIL - FLOOR);
          v = v <= 0 ? 0 : v >= 1 ? 1 : v;
          const k = (v * 255) | 0;
          d[i] = LUT[k * 4];
          d[i + 1] = LUT[k * 4 + 1];
          d[i + 2] = LUT[k * 4 + 2];
          d[i + 3] = LUT[k * 4 + 3];
          i += 4;
        }
      }
      fieldCtx.putImageData(image, 0, 0);

      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(field, 0, 0, gw, gh, 0, 0, width, height);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }

    function frame(now: number) {
      if (last && now - last < frameInterval) {
        raf = requestAnimationFrame(frame);
        return;
      }
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;
      draw();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf || reduced) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    }

    if (layout()) draw();

    const ro = new ResizeObserver(() => {
      if (layout() && !raf) draw();
    });
    ro.observe(canvas);

    let visible = false;
    const onVisibility = () => {
      if (visible && !document.hidden) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    let io: IntersectionObserver | null = null;
    if (!reduced) {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        onVisibility();
      });
      io.observe(canvas);
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
      ro.disconnect();
      stop();
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
