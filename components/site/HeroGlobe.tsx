"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { CS_TEAL_GLOW_UNIT, csInk, tealGlow } from "@/lib/colors";
import { isLand } from "@/lib/land-mask";

/**
 * The hero's globe — a solid dark ball with its continents picked out in dots,
 * turning slowly, ringed by dotted arcs, with a handful of planes tracing
 * orbits around it, each pulling a fading contrail.
 *
 * ── What it is ─────────────────────────────────────────────────────────────
 * An OPAQUE, shaded sphere: a matte body lit from the upper right, dots on
 * LAND ONLY (the ocean is bare surface, not faint dots), a thin specular
 * highlight along the lit arc of the silhouette, and several dotted arcs well
 * outside the limb. In brand teal rather than the reference's grey.
 *
 * ⚠️ Opaque is the load-bearing word, and it is what drives the draw order
 * below. An earlier version was a transparent point cloud — every dot on the
 * sphere drawn, the far side merely DIMMED — and it read as an open wireframe
 * you could see through rather than as a ball. A solid body hides its own far
 * side, so back-facing points are now CULLED outright, and the surface is laid
 * down BEFORE the dots that sit on it.
 *
 * There is deliberately no graticule. The continents carry the globe reading on
 * their own; lat/long lines on top of them read as a diagram.
 *
 * ── One deliberate departure from the reference ────────────────────────────
 * There, the sphere sits low and is cropped by the section's bottom edge. Ours
 * lives in the hero's right-hand grid cell, where a cropped ball would read as
 * a layout bug rather than as a composition, so it is rendered whole.
 *
 * ── Why canvas 2D and not WebGL ────────────────────────────────────────────
 * This is a projection of a few thousand points, two gradients and four arcs.
 * There is no geometry, no texture, no depth buffer and no shading model beyond
 * one dot product. `CodeFieldBackground` already does exactly this kind of work
 * well. Reaching for a second GL context would cost a context on a page that
 * already holds one, to draw circles.
 *
 * ── ⚠️ This one animates at rest, deliberately ─────────────────────────────
 * Every other canvas on this site idles at zero cost: `CodeFieldBackground`
 * stops its loop a frame after the field settles, and `AuroraBand` only runs
 * while it is on screen. This one runs continuously while it is visible,
 * because a globe that does not turn is not a globe — it is a textured disc,
 * and the rotation is the entire reason the curvature reads.
 *
 * That is an accepted exception, not an oversight. Do not "fix" it by adding a
 * settle test; there is nothing to settle to. What bounds it instead:
 *
 *   — an IntersectionObserver, so it stops dead the moment the hero leaves the
 *     viewport (this is the hero, so that is most of the session);
 *   — reduced motion, which paints one frame and never starts a loop at all;
 *   — a sample count that scales with the RENDERED box and is capped, so a 4K
 *     display does not quietly quadruple the dot count;
 *   — back-face culling, which halves the dots that reach the canvas at all.
 */

/*
 * ── Pointer: a slow LEAN and nothing else ──────────────────────────────────
 * The first version leaned toward the cursor AND lit the dots under it; the
 * founder called the composite ugly, and the dot-lighting — a white smear
 * chasing the mouse across the continents — was what earned that. It is gone
 * and stays gone. What he then asked for back is a smooth hover response, and
 * that is this: the sphere eases a few degrees toward the pointer, on a lazy
 * time-based ease, and it engages when the cursor is over the BALL itself —
 * cross the limb and the globe wakes; leave and it settles. No per-dot
 * response — the globe should feel like it noticed you, not like it is
 * following you.
 */

/** Seconds for one full revolution. Earth-slow on purpose: fast enough that a
 *  reader sees it move within a second or two of landing, slow enough that it
 *  never competes with the headline for attention. */
const SPIN_PERIOD = 55;

/** Axial tilt in radians (~23.4deg, Earth's). Enough to open one pole toward
 *  the viewer, so the continents sit on a believably tipped axis. */
const TILT = 0.409;

/** Sphere diameter as a fraction of the cell's smaller side — an upper bound
 *  only. The halo may reduce it further; see `layout()`. */
const FILL = 0.97;

/**
 * Target spacing between neighbouring samples, in CSS px, on the sphere's
 * surface. The sample count is derived from it and clamped, so dot density
 * stays constant across breakpoints instead of thinning out on a large display.
 *
 * Tight, because the dots have to resolve coastlines: at 5.8px Africa is ~28
 * dots tall at the hero's size and the Gulf, the Aegean and Indonesia survive
 * as recognisable shapes rather than collapsing into speckle.
 */
const DOT_SPACING = 5.8;
const MIN_SAMPLES = 4000;
/** ⚠️ The cap is the whole reason this is affordable. Uncapped, a 4K hero cell
 *  asks for ~90,000 samples every frame, forever, while it is on screen. */
const MAX_SAMPLES = 26000;

/** Dot radius, in CSS px, at the centre of the disc and at the limb. */
const DOT_R_CENTRE = 1.55;
const DOT_R_LIMB = 0.7;
/**
 * Exponent on the centre-to-limb ramp for dot size and ink. Dots crowd together
 * toward the limb because the surface is turning away; shrinking and dimming
 * them there is the foreshortening that makes the edge read as curvature rather
 * than as a painted circle.
 */
const LIMB_FALLOFF = 1.5;
/** Ink and radius multipliers for a dot right on the limb. */
const LIMB_ALPHA = 0.3;
/** Peak ink for a dot at the centre of the lit face. */
const INK = 0.92;
/** Below this the dot is invisible; skip it rather than pay for the path op. */
const MIN_VISIBLE_ALPHA = 0.02;
/**
 * How far the dots' teal is lifted toward white. The reference's are near-white
 * and pale against a dark ball; ours keep the brand hue but need the same
 * lightness separation from the body they sit on.
 */
const DOT_PALENESS = 0.42;

/**
 * Direction the light comes from, as a unit vector in view space.
 *
 * Upper RIGHT, matching the reference: the body lifts toward the top right and
 * falls away to the bottom left. X is mirrored under RTL, the same way
 * `AuroraBand` mirrors its beam with the LAYOUT rather than the viewport.
 */
const LIGHT: readonly [number, number, number] = [0.55, 0.5, 0.67];
/** Floor on the diffuse term, so the unlit side is dim rather than absent. */
const AMBIENT = 0.34;

/** Peak teal sheen on the body's lit shoulder. The body under it is opaque page
 *  ground, so this is the whole of the surface's colour. */
const BODY_SHEEN = 0.19;

/** Width and peak opacity of the specular edge traced along the lit limb. */
const RIM_WIDTH = 1.5;
const RIM_ALPHA = 0.6;
/**
 * How far round the silhouette the specular runs before it dies. The reference
 * shows a bright arc on the upper-right of the limb that fades as it wraps —
 * not a ring all the way round, which would read as an outline.
 */
const RIM_FADE = 0.32;

/** Peak yaw / pitch the sphere leans by, in radians, at full deflection.
 *  Under half the first version's angles: a lean you feel more than see. */
const PTR_YAW = 0.14;
const PTR_PITCH = 0.09;
/** Per-second approach to the lean target. Low on purpose — the sphere drifts
 *  after the cursor rather than tracking it, which is what "smooth" means at
 *  this size. */
const PTR_EASE = 2.6;

/**
 * How far the whole composition shifts toward the cursor, in px.
 *
 * ⚠️ This — not the yaw — is what makes the hover PERCEPTIBLE. The first
 * attempt folded a yaw into the spin angle, which on a sphere that is already
 * rotating is just a phase nudge: mathematically present, visually
 * nonexistent. The founder's "there is no hover effect" was the correct
 * reading of it. A translation is unmistakable at a glance; the halo arcs
 * move at under half the ball's factor, and that difference in rates is what
 * gives the hover DEPTH rather than the whole drawing sliding as one sticker.
 */
const PARALLAX_PX = 18;
const RING_PARALLAX = 0.45;

/**
 * How hard the LIGHT swings toward the cursor, added to the base direction
 * before normalising.
 *
 * ⚠️ This is the part of the hover you can actually SEE, and it exists because
 * two subtler attempts measurably ran and still read as nothing: a yaw folded
 * into the spin (a phase nudge on a sphere already spinning) and a small
 * parallax alone. Moving the light moves everything at once — which face of
 * the planet is lit, where the sheen sits, where the specular arc rides the
 * limb — as three big soft gradients, so it is impossible to miss and
 * impossible to make sharp. The founder asked three times; the third answer
 * is the lamp.
 */
const LIGHT_FOLLOW = 1.1;

/**
 * The movement glow: while the cursor is MOVING the whole globe lifts in
 * brightness by this much, and settles back once it stops. Deliberately small
 * — "just a little bit" is the founder's own spec — and asymmetric: it rises
 * quickly so the response feels connected to the hand, and falls at a third
 * of that rate so stopping reads as the globe exhaling, not as a light
 * switching off.
 */
const GLOW_BOOST = 0.18;
/** The sheen and rim take a stronger share of the lift than the dots — they
 *  ARE the glow, and lifting the dots alone just makes the map look louder. */
const GLOW_SHEEN = 0.5;
const GLOW_RIM = 0.3;
/** How long after the last mousemove the glow keeps its target, ms. */
const GLOW_HOLD_MS = 400;
const GLOW_RISE = 5.0;
const GLOW_FALL = 1.6;

/**
 * How much the whole composition grows while the cursor is over the ball.
 *
 * ⚠️ `layout()` divides its fit bounds by (1 + this), reserving the headroom —
 * without that, the grown orbits push past the canvas edge at full hover and
 * planes hit an invisible wall, the exact clipping bug the orbit-aware bounds
 * were added to prevent. The reserve costs ~3% of resting size, which the
 * compressed orbit altitudes more than buy back.
 */
const HOVER_GROW = 0.035;

/**
 * The same gate `CodeFieldBackground` puts on its pointer listener. Gates ONLY
 * the listener: the globe still renders and rotates on a phone.
 */
const INTERACTIVE = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

/**
 * Dotted halo arcs, as multiples of the sphere radius.
 *
 * ⚠️ These arcs are also what BOUND the sphere's size — `layout()` fits the
 * outermost one into the cell, so every step outward here shrinks the ball.
 * The first cut of this stack ran to 1.35 and cost the ball a quarter of the
 * cell's height in empty margin; the founder called the empty space out.
 * Hugging the limb keeps the halo and lets the ball take the cell.
 */
const RINGS = [1.07, 1.145, 1.22];
const RING_SQUASH = 0.97;
/**
 * Where an arc has faded to nothing, as a fraction of its vertical radius above
 * centre. The arcs are brightest over the top and fade out as they descend.
 *
 * ⚠️ This is also what keeps them inside the cell. An arc is at its widest at
 * the equator, which is exactly where this has already faded it to zero — so
 * `layout()` only has to fit the VISIBLE part, and the invisible remainder may
 * run past the cell edge without anything showing a cut.
 */
const RING_FADE_END = 0.62;
/** |cos| at the lowest still-visible point — how far out an arc actually reads. */
const RING_VISIBLE_COS = Math.sqrt(1 - RING_FADE_END * RING_FADE_END);
/** Dash pattern. With a round cap a near-zero dash renders as a dot. */
const RING_DASH: [number, number] = [0.6, 7];
const RING_INK = 0.3;

/**
 * The teal as numeric channels, derived from the shared token rather than
 * re-typed as a hex literal. Dots lerp between this and white, which needs
 * numbers — `CS_TEAL_GLOW_CHANNELS` is the string form and `tealGlow()` only
 * mints alpha variants.
 */
const TEAL: [number, number, number] = [
  Math.round(CS_TEAL_GLOW_UNIT[0] * 255),
  Math.round(CS_TEAL_GLOW_UNIT[1] * 255),
  Math.round(CS_TEAL_GLOW_UNIT[2] * 255),
];
/** The dots' pale teal, mixed once at module load rather than per dot. */
const DOT_RGB: [number, number, number] = [
  Math.round(TEAL[0] + (255 - TEAL[0]) * DOT_PALENESS),
  Math.round(TEAL[1] + (255 - TEAL[1]) * DOT_PALENESS),
  Math.round(TEAL[2] + (255 - TEAL[2]) * DOT_PALENESS),
];

/**
 * Quantisation of dot alpha into fill passes.
 *
 * ⚠️ A canvas fill takes ONE colour, so every dot sharing a pass shares an
 * alpha. Drawing each dot as its own `beginPath`/`arc`/`fill` would be three
 * rasteriser round-trips per dot, thousands of times a frame; batching every
 * dot of a level into a single path and filling once collapses that to
 * `ALPHA_LEVELS` fills.
 *
 * The level is taken on the SQUARE ROOT of alpha, so the dim limb dots — where
 * most of them are, and where banding would show as rings — get finer steps
 * than the bright centre.
 */
const ALPHA_LEVELS = 26;

const TAU = Math.PI * 2;
const DEG = 180 / Math.PI;

/*
 * ── Planes ─────────────────────────────────────────────────────────────────
 * A handful of aircraft on circular orbits just above the surface, each pulling
 * a contrail that fades behind it. This is the one piece of the globe that is
 * an ARGUMENT rather than a texture: the product sells flights, and the ball
 * under these dots is where they fly.
 *
 * The orbits are fixed in VIEW space — they take the axial tilt but not the
 * spin. A real aircraft does move with the sky rather than with the ground, and
 * visually it is what reads: fixed inclined tracks with the earth turning
 * beneath them. Orbits that spun with the surface would just be more rotation.
 *
 * ⚠️ Each orbit is defined by its plane's NORMAL, given in spherical angles,
 * and the two basis vectors spanning that plane are precomputed here at module
 * load — they are pure trigonometry of constants, and deriving them per frame
 * would be the only allocation in the loop.
 */
interface PlaneDef {
  /** Orbit-plane normal, spherical: polar angle from +y, then azimuth. */
  theta: number;
  phi: number;
  /** Orbit radius, as a multiple of the sphere's. Skimming, not satellite. */
  alt: number;
  /** Seconds per lap. NEGATIVE flies the orbit the other way round. */
  period: number;
  /** Phase offset, so the fleet never bunches. */
  phase: number;
  /** Relative dart size. */
  size: number;
}

/* ⚠️ Altitudes are deliberately COMPRESSED (1.03–1.06). The fleet's highest
   orbit is one of the bounds `layout()` fits into the canvas, so every step of
   altitude is paid for in ball size — at the old ceiling of 1.12 the ball gave
   up ~6% of its radius to orbital clearance. Skimming lower reads better
   anyway: contrails hug the surface like traffic, not satellites. */
const PLANE_DEFS: readonly PlaneDef[] = [
  { theta: 1.15, phi: 0.35, alt: 1.04, period: 21, phase: 0.4, size: 1.0 },
  { theta: 2.05, phi: 1.9, alt: 1.055, period: 27, phase: 2.6, size: 0.85 },
  { theta: 0.72, phi: 4.1, alt: 1.045, period: -23, phase: 4.6, size: 0.9 },
  { theta: 1.62, phi: 5.2, alt: 1.06, period: 31, phase: 1.3, size: 1.1 },
  { theta: 0.45, phi: 2.6, alt: 1.035, period: 18, phase: 3.5, size: 0.8 },
  { theta: 1.35, phi: 3.6, alt: 1.055, period: -26, phase: 5.5, size: 0.95 },
  { theta: 1.85, phi: 0.9, alt: 1.04, period: 24, phase: 1.9, size: 0.75 },
  { theta: 0.95, phi: 5.9, alt: 1.05, period: 22, phase: 0.9, size: 0.9 },
  { theta: 2.3, phi: 3.0, alt: 1.03, period: -19, phase: 2.1, size: 0.7 },
  { theta: 1.5, phi: 2.2, alt: 1.06, period: 29, phase: 5.0, size: 1.0 },
];

/**
 * The highest orbit, which `layout()` must fit inside the canvas alongside the
 * ball and the halo. ⚠️ Without this bound the widest points of an orbit fell
 * PAST the canvas edge at desktop sizes, and a plane crossing the equator hit
 * an invisible vertical wall — the trail just ended mid-air, which reads as a
 * bug the moment a reader happens to watch it happen.
 */
const PLANE_MAX_ALT = Math.max(...PLANE_DEFS.map((d) => d.alt));

/**
 * The aircraft silhouette — a top-down airliner, nose toward +x, in unit
 * coordinates scaled at draw time. One half is authored (fuselage taper, a
 * swept wing, a swept tailplane) and the other is mirrored from it, so the two
 * sides cannot drift apart under tuning. It replaced a four-point paper dart;
 * at hero size the dart read as a toy, and the founder said so.
 */
const AIRCRAFT_HALF: ReadonlyArray<readonly [number, number]> = [
  [6.2, 0], // nose tip
  [5.0, 0.6], // nose flare into the fuselage side
  [1.7, 0.7], // wing root, leading edge
  [-0.7, 4.7], // wingtip, leading edge (swept back)
  [-1.9, 4.7], // wingtip chord
  [-1.0, 0.7], // wing root, trailing edge
  [-3.7, 0.55], // tailplane root, leading edge
  [-5.5, 2.4], // tailplane tip, leading edge
  [-6.2, 2.4], // tailplane tip chord
  [-5.3, 0.45], // tailplane root, trailing edge
  [-5.9, 0], // tail cone
];
const AIRCRAFT: ReadonlyArray<readonly [number, number]> = [
  ...AIRCRAFT_HALF,
  ...AIRCRAFT_HALF.slice(1, -1)
    .reverse()
    .map(([x, y]) => [x, -y] as const),
];

/*
 * ── Destinations ───────────────────────────────────────────────────────────
 * Beacon markers PINNED to real cities: a bright core with a soft glow and an
 * expanding ring that pulses on its own clock per city. Unlike the planes they
 * live on the SURFACE and rotate with it — a destination is a place, not a
 * vehicle — so they ride the same spin as the land dots, disappear round the
 * far side, and come back.
 *
 * ⚠️ The first version drew literal hotel BUILDINGS here — a tower with
 * windows and a door. At twelve pixels a building is a smudge with holes in
 * it; the founder called it ugly and unrelated, and he was right. A pulsing
 * beacon says "we are live here", which is the true claim, in the globe's own
 * dot language.
 */
const HOTEL_SPOTS: ReadonlyArray<readonly [number, number]> = [
  [44.4, 33.3], // Baghdad
  [44.0, 36.2], // Erbil
  [28.98, 41.0], // Istanbul
  [55.3, 25.2], // Dubai
  [-0.13, 51.5], // London
  [-74.0, 40.7], // New York
  [139.7, 35.7], // Tokyo
  [36.8, -1.3], // Nairobi
];

/** The spots as unit vectors in the globe's OBJECT space — the exact inverse
 *  of the mapping the land dots use (`lon = atan2(-z, x)`), so a marker lands
 *  on the same continent pixel its city's dots do. Get the sign of z wrong and
 *  every hotel sits mirrored into an ocean. */
const HOTELS: ReadonlyArray<readonly [number, number, number]> = HOTEL_SPOTS.map(
  ([lon, lat]) => {
    const la = (lat / DEG) as number;
    const lo = (lon / DEG) as number;
    return [
      Math.cos(la) * Math.cos(lo),
      Math.sin(la),
      -Math.cos(la) * Math.sin(lo),
    ] as const;
  },
);

/** Below this facing, a marker is gone; it fades in across the band above so
 *  beacons dissolve at the limb instead of popping. */
const HOTEL_CULL = 0.08;
const HOTEL_FADE = 0.3;
/** Seconds per beacon pulse. Staggered per city by `hash`, so the fleet of
 *  rings never fires in unison like a status page. */
const PULSE_S = 2.6;

/** Contrail length, as an ARC of the orbit, in radians (~29 deg).
 *
 *  ⚠️ Not seconds. A duration-based trail scales with speed, and the fastest
 *  plane in the fleet (18s a lap) swept ~48 deg of orbit — projected across the
 *  front of the disc that is a chord half the globe wide, and it read as a
 *  laser scratch rather than a contrail. A fixed arc gives every plane the
 *  same-length comet whatever its period, retrograde included.
 *
 *  Sampled parametrically from the orbit rather than from a position history,
 *  so there is no buffer to fill, and the first painted frame — including the
 *  reduced-motion still — already carries full trails. */
const TRAIL_ARC = 0.5;
const TRAIL_SEGS = 34;
/** Contrail ink at the plane, before the tail fade and the depth dim. */
const TRAIL_INK = 0.42;

interface PlaneOrbit extends PlaneDef {
  e1: [number, number, number];
  e2: [number, number, number];
}

const PLANES: readonly PlaneOrbit[] = PLANE_DEFS.map((d) => {
  const n: [number, number, number] = [
    Math.sin(d.theta) * Math.cos(d.phi),
    Math.cos(d.theta),
    Math.sin(d.theta) * Math.sin(d.phi),
  ];
  // Any vector not parallel to the normal seeds the basis; y-up unless the
  // orbit is near-equatorial-normal, where x steps in.
  const ref: [number, number, number] =
    Math.abs(n[1]) < 0.99 ? [0, 1, 0] : [1, 0, 0];
  const c1: [number, number, number] = [
    n[1] * ref[2] - n[2] * ref[1],
    n[2] * ref[0] - n[0] * ref[2],
    n[0] * ref[1] - n[1] * ref[0],
  ];
  const l1 = Math.hypot(c1[0], c1[1], c1[2]) || 1;
  const e1: [number, number, number] = [c1[0] / l1, c1[1] / l1, c1[2] / l1];
  const e2: [number, number, number] = [
    n[1] * e1[2] - n[2] * e1[1],
    n[2] * e1[0] - n[0] * e1[2],
    n[0] * e1[1] - n[1] * e1[0],
  ];
  return { ...d, e1, e2 };
});

/**
 * Deterministic per-index pseudo-random — the same shape `CodeFieldBackground`
 * uses for its grid cells.
 *
 * ⚠️ NOT `Math.random()`. The point set is rebuilt on every resize, so a real
 * random would re-roll every dot's grain each time the box changed size —
 * dragging a window edge would visibly reprint the globe, and the
 * ResizeObserver fires on the font swap too.
 */
function hash(a: number, b: number): number {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    // Fail soft: a browser that hands back no 2D context leaves an empty,
    // correctly-sized box rather than throwing through the hero.
    if (!canvas || !ctx) return;

    // ── Writing direction ──────────────────────────────────────────────────
    // Same rule as `AuroraBand`'s `uFlip`: the light mirrors with the LAYOUT,
    // because in RTL the globe sits in the opposite column.
    const dir =
      canvas.closest("[dir]")?.getAttribute("dir") ??
      document.documentElement.getAttribute("dir") ??
      "ltr";
    const flip = dir.toLowerCase() === "rtl" ? -1 : 1;
    const lightX = LIGHT[0] * flip;

    // ── Object-space point set — LAND ONLY, rebuilt by `layout()` ──────────
    // Ocean samples are discarded at layout rather than skipped per frame:
    // roughly two thirds of the sphere is sea, so dropping them there takes
    // two thirds of the per-frame transform work with them.
    let px = new Float32Array(0);
    let py = new Float32Array(0);
    let pz = new Float32Array(0);
    /** Per-dot ink variation, so the continents have grain instead of looking printed. */
    let grain = new Float32Array(0);
    let count = 0;

    /** Scratch, reused every frame. */
    let sx = new Float32Array(0);
    let sy = new Float32Array(0);
    let srad = new Float32Array(0);

    // One index list per alpha level. Preallocated and truncated rather than
    // rebuilt, so a frame allocates nothing.
    const levels: number[][] = Array.from({ length: ALPHA_LEVELS }, () => []);

    let width = 0;
    let height = 0;
    let radius = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let elapsed = 0;
    let last = 0;

    /** The lean, and where it is headed. Targets move with the pointer; the
     *  actuals ease toward them in `frame()`. */
    let ptrTargetX = 0;
    let ptrTargetY = 0;
    let ptrX = 0;
    let ptrY = 0;
    /** The movement glow (0..1), when the cursor last moved, and how deep
     *  inside the globe it was when it did. */
    let glow = 0;
    let glowPeak = 0;
    let lastMoveAt = -1e9;
    /** Presence over the ball (0..1). Unlike `glow` it does NOT decay while
     *  the cursor rests in place — a hand parked on the globe is still there,
     *  so the size holds until it actually leaves. */
    let pres = 0;
    let presTarget = 0;


    /**
     * Size the backing store from the ELEMENT and re-deal the point set.
     *
     * ⚠️ The cell, not `window.innerWidth`: this canvas is one cell of the
     * hero's grid, and on a desktop it is a third of the viewport's width.
     * Sizing from the window would over-draw by ~9x in area.
     */
    function layout(): boolean {
      if (!canvas || !ctx) return false;
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      // No layout box yet; the ResizeObserver calls back with the real size.
      if (cssW < 2 || cssH < 2) return false;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = cssW;
      height = cssH;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cx = cssW / 2;
      cy = cssH / 2;

      // ⚠️ The radius is bounded by the HALO, not only by the ball. Sizing the
      // sphere alone and then drawing arcs outside it is what clips them on a
      // short cell; deriving both together means the composition fits whatever
      // shape the grid hands us, at every breakpoint, with no per-breakpoint
      // constant to keep in step.
      const outer = RINGS[RINGS.length - 1];
      // Everything that must FIT is divided by the hover growth, so the grown
      // state — not the resting one — is what the cell bounds. See HOVER_GROW.
      const grown = 1 + HOVER_GROW;
      radius = Math.min(
        (Math.min(cssW, cssH) * FILL) / 2,
        (cx - 2) / (outer * RING_VISIBLE_COS * grown),
        (cy - 2) / (outer * RING_SQUASH * grown),
        // The planes reach further from the centre than the ball does, and
        // unlike the halo arcs they do not fade before their widest point.
        (cx - 2) / (PLANE_MAX_ALT * grown),
        (cy - 2) / (PLANE_MAX_ALT * grown),
      );

      // Samples from the target spacing: for N points spread evenly over a
      // sphere of radius R, each owns 4*PI*R^2/N of surface, so neighbours sit
      // about sqrt(that) apart.
      const samples = Math.max(
        MIN_SAMPLES,
        Math.min(MAX_SAMPLES, Math.round((4 * Math.PI * radius * radius) / (DOT_SPACING * DOT_SPACING))),
      );

      // ── Fibonacci sphere, filtered to land ──────────────────────────────
      // ⚠️ Not a lat/long grid. A naive grid bunches hard at the poles — the
      // two spots on a rotating globe a reader looks at longest — and leaves
      // the equator sparse. The golden-angle spiral is even everywhere, which
      // is what keeps a coastline evenly sampled whichever way it runs.
      const golden = Math.PI * (3 - Math.sqrt(5));
      const lx: number[] = [];
      const ly: number[] = [];
      const lz: number[] = [];
      const lg: number[] = [];
      for (let i = 0; i < samples; i++) {
        const y = 1 - (i / (samples - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = golden * i;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;

        // ⚠️ `-z`, not `z`. Screen x is `+x1`, and the spin carries the front
        // face toward +x, so longitude has to INCREASE to the right for the
        // world to be the right way round and to turn eastward like Earth.
        // `atan2(z, x)` gives a plausible globe that is MIRRORED, which is far
        // harder to notice than a broken one.
        const lon = Math.atan2(-z, x) * DEG;
        const lat = Math.asin(Math.max(-1, Math.min(1, y))) * DEG;
        if (!isLand(lon, lat)) continue;

        lx.push(x);
        ly.push(y);
        lz.push(z);
        lg.push(0.66 + hash(1, i) * 0.5);
      }

      count = lx.length;
      px = Float32Array.from(lx);
      py = Float32Array.from(ly);
      pz = Float32Array.from(lz);
      grain = Float32Array.from(lg);
      sx = new Float32Array(count);
      sy = new Float32Array(count);
      srad = new Float32Array(count);
      return true;
    }

    function draw() {
      if (!ctx || !count) return;
      ctx.clearRect(0, 0, width, height);

      // Spin, plus the pointer's lean. Folding the lean into the same two
      // angles the projection already uses is what makes it a real tilt of
      // the sphere — planes, hotels and dots all lean together — rather than
      // a 2D skew of the finished image.
      const spin = (elapsed / SPIN_PERIOD) * TAU + ptrX * PTR_YAW;
      const tilt = TILT + ptrY * PTR_PITCH;
      const cs = Math.cos(spin);
      const ss = Math.sin(spin);
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);

      // The parallax. The ball and everything on it shift toward the cursor;
      // the halo arcs shift by less than half as much, so the layers separate
      // and the hover reads as depth. See PARALLAX_PX for why this exists.
      const lift = 1 + glow * GLOW_BOOST;
      // The hover growth. Layout reserved the headroom, so at full presence
      // nothing — orbits included — can leave the canvas.
      const R = radius * (1 + pres * HOVER_GROW);
      const gx = cx + ptrX * PARALLAX_PX;
      const gy = cy - ptrY * PARALLAX_PX;
      const rgx = cx + ptrX * PARALLAX_PX * RING_PARALLAX;
      const rgy = cy - ptrY * PARALLAX_PX * RING_PARALLAX;

      // Where the light lands on screen, as a UNIT direction. Canvas y grows
      // downward, so the vertical component is negated to put the light UP.
      //
      // ⚠️ Normalised, so the specular gradient below can start exactly ON the
      // limb. Using the raw components put its first stop 0.74 of a R from
      // the centre — inside the ball — and every point on the circle beyond
      // that clamped to stop 0, so a broad arc from 9 o'clock to 2 o'clock came
      // out at FULL brightness and the highlight read as a hard outline round
      // the whole top of the sphere instead of a specular on one shoulder.
      // The lamp: base direction plus the eased pointer, renormalised. With
      // the cursor at rest (or gone) this is exactly the base light; as it
      // moves, the lit face of the planet follows it.
      const elx = lightX + ptrX * LIGHT_FOLLOW;
      const ely = LIGHT[1] + ptrY * LIGHT_FOLLOW;
      const elen = Math.hypot(elx, ely, LIGHT[2]) || 1;
      const nlx = elx / elen;
      const nly = ely / elen;
      const nlz = LIGHT[2] / elen;

      const lightLen = Math.hypot(nlx, nly) || 1;
      const lnx = nlx / lightLen;
      const lny = nly / lightLen;
      const litX = gx + lnx * R;
      const litY = gy - lny * R;

      // ── Dotted halo arcs ────────────────────────────────────────────────
      // Behind the ball, and outside it — the body below never reaches them.
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.setLineDash(RING_DASH);
      for (const k of RINGS) {
        const rx = R * k;
        const ry = rx * RING_SQUASH;
        // Brightest over the top, gone by `RING_FADE_END` of the way down —
        // which is also what hides the fact that the widest part of the arc may
        // lie outside the cell.
        const g = ctx.createLinearGradient(0, rgy - ry, 0, rgy - ry * RING_FADE_END);
        g.addColorStop(0, tealGlow(RING_INK));
        g.addColorStop(0.55, tealGlow(RING_INK * 0.5));
        g.addColorStop(1, tealGlow(0));
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.ellipse(rgx, rgy, rx, ry, 0, 0, TAU);
        ctx.stroke();
      }
      // ⚠️ Restore before anything else — an escaped dash pattern turns every
      // later stroke on this context dotted too.
      ctx.restore();

      // ── The body ────────────────────────────────────────────────────────
      // Opaque page ground first, so the ball genuinely occludes the token
      // field and the ambient wash behind it, then a teal sheen offset toward
      // the light for the matte shading. Two fills of ONE path.
      ctx.beginPath();
      ctx.arc(gx, gy, R, 0, TAU);
      ctx.fillStyle = csInk(1);
      ctx.fill();

      const sheen = ctx.createRadialGradient(
        gx + nlx * R * 0.55,
        gy - nly * R * 0.55,
        R * 0.04,
        gx,
        gy,
        R * 1.08,
      );
      sheen.addColorStop(0, tealGlow(BODY_SHEEN * (1 + glow * GLOW_SHEEN)));
      sheen.addColorStop(0.5, tealGlow(BODY_SHEEN * 0.42 * (1 + glow * GLOW_SHEEN)));
      sheen.addColorStop(1, tealGlow(0));
      ctx.fillStyle = sheen;
      ctx.fill();

      // ── Dots, front face only ───────────────────────────────────────────
      for (let L = 0; L < ALPHA_LEVELS; L++) levels[L].length = 0;

      for (let i = 0; i < count; i++) {
        // Spin about the globe's own axis, then tilt that axis toward us.
        const x1 = px[i] * cs + pz[i] * ss;
        const z1 = -px[i] * ss + pz[i] * cs;
        const y2 = py[i] * ct - z1 * st;
        const z2 = py[i] * st + z1 * ct;

        // ⚠️ Back-face CULL, not a dim. The body above is opaque, so a point on
        // the far side is behind a surface and must not be drawn at all.
        if (z2 <= 0) continue;

        const ex = gx + x1 * R;
        const ey = gy - y2 * R;

        // `z2` is the cosine of the angle between the surface and the viewer:
        // 1 at the centre of the disc, 0 at the limb. Everything about
        // foreshortening falls out of it.
        const face = Math.pow(z2, LIMB_FALLOFF);

        // One dot product against the light. The point IS its own normal on a
        // unit sphere, which is the whole reason this costs nothing.
        const diffuse = Math.max(0, x1 * nlx + y2 * nly + z2 * nlz);
        const shade = AMBIENT + (1 - AMBIENT) * diffuse;

        let alpha = INK * lift * grain[i] * shade * (LIMB_ALPHA + (1 - LIMB_ALPHA) * face);
        if (alpha < MIN_VISIBLE_ALPHA) continue;
        if (alpha > 1) alpha = 1;

        sx[i] = ex;
        sy[i] = ey;
        srad[i] = DOT_R_LIMB + (DOT_R_CENTRE - DOT_R_LIMB) * face;

        // Bucket on sqrt(alpha) — see ALPHA_LEVELS.
        const L = Math.min(ALPHA_LEVELS - 1, Math.floor(Math.sqrt(alpha) * ALPHA_LEVELS));
        levels[L].push(i);
      }

      for (let L = 0; L < ALPHA_LEVELS; L++) {
        const bucket = levels[L];
        if (!bucket.length) continue;
        // Undo the sqrt taken when bucketing, at the level's midpoint.
        const t = (L + 0.5) / ALPHA_LEVELS;
        ctx.fillStyle = `rgba(${DOT_RGB[0]}, ${DOT_RGB[1]}, ${DOT_RGB[2]}, ${(t * t).toFixed(4)})`;
        ctx.beginPath();
        for (const i of bucket) {
          // ⚠️ `moveTo` before each `arc`, or the arc is joined to the previous
          // subpath by a straight line and the globe fills with spokes.
          ctx.moveTo(sx[i] + srad[i], sy[i]);
          ctx.arc(sx[i], sy[i], srad[i], 0, TAU);
        }
        ctx.fill();
      }

      // ── Specular limb ───────────────────────────────────────────────────
      // A thin bright arc along the lit side of the silhouette, fading as it
      // wraps. A LINEAR gradient across the light axis, not a radial one: the
      // brightness has to vary AROUND the circumference, which a radial
      // gradient centred on the ball cannot express — it can only vary the
      // width of an otherwise even ring.
      const spec = ctx.createLinearGradient(
        litX,
        litY,
        gx - lnx * R,
        gy + lny * R,
      );
      spec.addColorStop(0, tealGlow(Math.min(1, RIM_ALPHA * (1 + glow * GLOW_RIM))));
      spec.addColorStop(RIM_FADE, tealGlow(RIM_ALPHA * 0.16 * (1 + glow * GLOW_RIM)));
      spec.addColorStop(1, tealGlow(0));
      ctx.strokeStyle = spec;
      ctx.lineWidth = RIM_WIDTH;
      ctx.beginPath();
      ctx.arc(gx, gy, R - RIM_WIDTH / 2, 0, TAU);
      ctx.stroke();

      // ── Destination beacons ─────────────────────────────────────────────
      // Surface objects: they take the SPIN (unlike the planes) and sit under
      // them in the draw order, since anything flying is above anything built.
      for (let hi = 0; hi < HOTELS.length; hi++) {
        const hSpot = HOTELS[hi];
        const hx1 = hSpot[0] * cs + hSpot[2] * ss;
        const hz1 = -hSpot[0] * ss + hSpot[2] * cs;
        const hy2 = hSpot[1] * ct - hz1 * st;
        const hz2 = hSpot[1] * st + hz1 * ct;
        if (hz2 <= HOTEL_CULL) continue;
        // Fade in from the limb, and inherit the same lighting the dots get so
        // a beacon on the dark side is dim like its surroundings.
        const fade = Math.min(1, (hz2 - HOTEL_CULL) / (HOTEL_FADE - HOTEL_CULL));
        const hDiffuse = Math.max(0, hx1 * nlx + hy2 * nly + hz2 * nlz);
        const hInk = fade * lift * (AMBIENT + (1 - AMBIENT) * hDiffuse);
        if (hInk < MIN_VISIBLE_ALPHA) continue;

        const hex = gx + hx1 * R;
        const hey = gy - hy2 * R;
        const hs = (0.55 + 0.45 * hz2) * (R / 240);

        // Soft glow, then the bright core over it.
        ctx.fillStyle = tealGlow(0.22 * hInk);
        ctx.beginPath();
        ctx.arc(hex, hey, 5.5 * hs, 0, TAU);
        ctx.fill();

        ctx.fillStyle = `rgba(235, 255, 252, ${(0.95 * hInk).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(hex, hey, 2.1 * hs, 0, TAU);
        ctx.fill();

        // The pulse: one ring expanding out of the core and fading as it
        // grows, on a per-city phase so the set never fires in unison. Squashed
        // by the surface's facing, so a ring near the limb flattens into the
        // sphere instead of hovering over it as a flat sticker.
        const pulse = (elapsed / PULSE_S + hash(3, hi)) % 1;
        const pr = (2.5 + pulse * 8.5) * hs;
        const pa = (1 - pulse) * (1 - pulse) * 0.55 * hInk;
        if (pa > MIN_VISIBLE_ALPHA) {
          ctx.strokeStyle = tealGlow(pa);
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.ellipse(hex, hey, pr, pr * (0.35 + 0.65 * hz2), 0, 0, TAU);
          ctx.stroke();
        }
      }

      // ── Planes ──────────────────────────────────────────────────────────
      // Drawn last: an aircraft above the surface passes in front of
      // everything the ball owns. Depth is handled per POINT, not per plane —
      // a single orbit is in front of the sphere on one side of its lap and
      // behind it on the other, and the trail can straddle the limb.
      //
      // ⚠️ The occlusion test is NOT `z < 0`. The orbit R is bigger than
      // the sphere's, so a point on the far side can still project OUTSIDE the
      // disc and peek past the limb — hiding it there would make planes pop
      // out of empty space a dozen pixels clear of the edge. Hidden means
      // behind the ball AND inside its silhouette; the re-emergence at the
      // limb that this produces is most of why the orbits read as 3D.
      ctx.lineCap = "round";
      for (const pl of PLANES) {
        const w = TAU / pl.period;
        let prevEx = 0;
        let prevEy = 0;
        let prevVis = false;
        let headEx = 0;
        let headEy = 0;
        let headAng = 0;
        let headDep = 0;
        let headVis = false;

        // s = 0 is the plane; the rest walk back along the last
        // TRAIL_SECONDS of its path. Parametric, so no history buffer — the
        // first frame ever painted already trails correctly.
        const back = Math.sign(w) * TRAIL_ARC;
        for (let seg = 0; seg <= TRAIL_SEGS; seg++) {
          const u = pl.phase + elapsed * w - (seg / TRAIL_SEGS) * back;
          const cu = Math.cos(u);
          const su = Math.sin(u);
          const ox = pl.alt * (pl.e1[0] * cu + pl.e2[0] * su);
          const oy = pl.alt * (pl.e1[1] * cu + pl.e2[1] * su);
          const oz = pl.alt * (pl.e1[2] * cu + pl.e2[2] * su);

          // The same view tilt the dots get — and deliberately NOT the spin.
          // The tracks are fixed in the sky while the ground turns beneath
          // them; giving them the spin would just be more rotation.
          const vy = oy * ct - oz * st;
          const vz = oy * st + oz * ct;
          const ex = gx + ox * R;
          const ey = gy - vy * R;
          const vis = !(vz < 0 && Math.hypot(ox, vy) < 1);
          const dep = (vz / pl.alt + 1) / 2;

          if (seg === 0) {
            headEx = ex;
            headEy = ey;
            headVis = vis;
            headDep = dep;
            // Heading, in screen space, from the time-derivative of the
            // orbit — dividing by the period keeps its SIGN, so a retrograde
            // plane's dart points the way it actually flies.
            const dx = (-pl.e1[0] * su + pl.e2[0] * cu) / pl.period;
            const dyv = ((-pl.e1[1] * su + pl.e2[1] * cu) * ct -
              (-pl.e1[2] * su + pl.e2[2] * cu) * st) / pl.period;
            headAng = Math.atan2(-dyv, dx);
          } else if (prevVis && vis) {
            // Contrail segment. Per-segment stroke because both the ink and
            // the width taper toward the tail — a single path takes one of
            // each. The far side is dimmed as well as faded, so a trail
            // wrapping the limb recedes instead of just stopping.
            const tail = 1 - seg / TRAIL_SEGS;
            ctx.strokeStyle = tealGlow(
              TRAIL_INK * Math.pow(tail, 1.8) * (0.35 + 0.65 * dep),
            );
            ctx.lineWidth = 0.4 + 1.5 * tail;
            ctx.beginPath();
            ctx.moveTo(prevEx, prevEy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
          }

          prevEx = ex;
          prevEy = ey;
          prevVis = vis;
        }

        // The aircraft, after its trail so the contrail slides UNDER it.
        if (headVis) {
          const sc = pl.size * (0.62 + 0.45 * headDep) * (R / 240);

          // A soft halo under the dart, so the head reads at a glance even
          // over the bright side of the ball.
          ctx.fillStyle = tealGlow(0.08 + 0.16 * headDep);
          ctx.beginPath();
          ctx.arc(headEx, headEy, 5.5 * sc, 0, TAU);
          ctx.fill();

          // The airliner, nose along the velocity.
          ctx.save();
          ctx.translate(headEx, headEy);
          ctx.rotate(headAng);
          ctx.fillStyle = `rgba(235, 255, 252, ${(0.55 + 0.45 * headDep).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(AIRCRAFT[0][0] * sc, AIRCRAFT[0][1] * sc);
          for (let k = 1; k < AIRCRAFT.length; k++) {
            ctx.lineTo(AIRCRAFT[k][0] * sc, AIRCRAFT[k][1] * sc);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
    }

    function frame(now: number) {
      if (!last) last = now;
      // Clamped, so a backgrounded tab cannot teleport the globe half a turn
      // on the frame it comes back.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      const k = Math.min(1, dt * PTR_EASE);
      ptrX += (ptrTargetX - ptrX) * k;
      ptrY += (ptrTargetY - ptrY) * k;

      const glowTarget = now - lastMoveAt < GLOW_HOLD_MS ? glowPeak : 0;
      const gk = Math.min(1, dt * (glowTarget > glow ? GLOW_RISE : GLOW_FALL));
      glow += (glowTarget - glow) * gk;
      pres += (presTarget - pres) * k;

      draw();
      raf = requestAnimationFrame(frame);
    }

    // ⚠️ Same discipline as `HeroBackground` and `CodeFieldBackground`:
    // `getBoundingClientRect` is a layout read, so it is CACHED and invalidated
    // by scroll/resize rather than taken inside the move handler.
    const interactive =
      !reduced &&
      typeof window.matchMedia === "function" &&
      window.matchMedia(INTERACTIVE).matches;

    let rect: DOMRect | null = null;
    let rectStale = true;
    const invalidateRect = () => {
      rectStale = true;
    };

    function onPointerMove(e: MouseEvent) {
      if (!canvas || !radius) return;
      if (rectStale || !rect) {
        rect = canvas.getBoundingClientRect();
        rectStale = false;
      }
      // ── The hover engages over the GLOBE, not the page ──────────────────
      // Position relative to the ball's centre, in radii. `influence` is 1
      // inside the ball, fades across a band just past the limb, and is 0
      // beyond it — and every target is SCALED by it, so crossing the edge
      // moves the targets continuously instead of snapping them. The eased
      // actuals then make both the engage and the release read as the globe
      // waking and settling rather than switching.
      const nx = (e.clientX - rect.left - cx) / radius;
      const ny = -((e.clientY - rect.top - cy) / radius);
      const d = Math.hypot(nx, ny);
      const influence = Math.max(0, Math.min(1, (1.12 - d) / 0.14));

      ptrTargetX = Math.max(-1, Math.min(1, nx)) * influence;
      ptrTargetY = Math.max(-1, Math.min(1, ny)) * influence;
      presTarget = influence;
      if (influence > 0.02) {
        lastMoveAt = performance.now();
        glowPeak = influence;
      }
    }

    function onPointerLeave() {
      ptrTargetX = 0;
      ptrTargetY = 0;
      presTarget = 0;
    }

    let listening = false;
    function attachPointer() {
      if (listening || !interactive) return;
      listening = true;
      rectStale = true;
      window.addEventListener("mousemove", onPointerMove);
      document.addEventListener("mouseleave", onPointerLeave);
      window.addEventListener("scroll", invalidateRect, { passive: true });
      window.addEventListener("resize", invalidateRect);
    }
    function detachPointer() {
      if (!listening) return;
      listening = false;
      window.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("scroll", invalidateRect);
      window.removeEventListener("resize", invalidateRect);
      // Ease home rather than staying leant by wherever the cursor was when
      // the hero scrolled away.
      onPointerLeave();
    }

    function start() {
      if (raf || reduced) return;
      last = 0;
      attachPointer();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      detachPointer();
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    }

    // The first frame — and under reduced motion the ONLY frame. Painted here
    // rather than left to the observer's first callback, so it does not depend
    // on when that lands.
    if (layout()) draw();

    const ro = new ResizeObserver(() => {
      if (layout() && !raf) draw();
    });
    ro.observe(canvas);

    // ⚠️ The bound on the always-running loop. Without this the globe spins for
    // the whole session, including the ten screens of page below it.
    let io: IntersectionObserver | null = null;
    if (!reduced) {
      io = new IntersectionObserver(([entry]) =>
        entry.isIntersecting ? start() : stop(),
      );
      io.observe(canvas);
    }

    return () => {
      io?.disconnect();
      ro.disconnect();
      stop();
    };
  }, [reduced]);

  return (
    // The cell HeroProductPreview occupied. Its height at `lg` is unchanged at
    // 600px — the hero grid is `items-center`, so a taller cell here would
    // re-centre the copy column beside it and move the headline.
    <div className="relative select-none" aria-hidden="true">
      {/* Ambient wash, around the ball rather than under it — the body is
          opaque, so this only reads as the glow the sphere casts into the cell.
          A gradient and not a blur filter: layered shadows on a near-black
          ground turn into grey mud. */}
      <div
        className="pointer-events-none absolute -inset-8"
        style={{
          background: `radial-gradient(ellipse 62% 55% at 50% 46%, ${tealGlow(0.16)}, transparent 72%)`,
        }}
      />
      {/* At `lg` the canvas borrows 2.5rem of the grid gap on each side and
          runs 640px tall. The orbits swing wider than the ball, and bounding
          the ball by the orbits inside the bare cell would shrink it — the
          founder asked for BIGGER, twice. The hero grid's gap is 5rem at `lg`,
          so 2.5rem from this side still leaves 2.5rem of true clearance to the
          copy column; the extra height re-centres the row by ~20px, which the
          `items-center` grid absorbs symmetrically. */}
      <canvas
        ref={canvasRef}
        className="relative mx-auto block h-[400px] w-full max-w-[420px] lg:-mx-10 lg:h-[640px] lg:w-[calc(100%+5rem)] lg:max-w-none"
      />
    </div>
  );
}
