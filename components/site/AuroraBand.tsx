"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { CS_TEAL_GLOW_UNIT, TS_PURPLE_GLOW_UNIT } from "@/lib/colors";

interface Props {
  variant?: "teal" | "purple";
}

/**
 * The hero's aurora band — a layered ribbon of brand light crossing the fold.
 *
 * ── Provenance ─────────────────────────────────────────────────────────────
 * The band-generating core below (the fisheye'd + domain-warped coordinate,
 * the per-band `1 - exp(-bw / exp(bw * m))` falloff, the pointer parallax and
 * the "toward the cursor" pull) is PORTED from React Bits' `ColorBends`, a
 * free registry component:
 *
 *     https://reactbits.dev/r/ColorBends-TS-TW
 *
 * ⚠️ It is a shader port, not a component install. The registry item declares
 * `three@^0.180.0`, and its entire use of the library is `WebGLRenderer ·
 * Scene · OrthographicCamera · PlaneGeometry · ShaderMaterial · Mesh · Clock ·
 * Vector2/3` — a full-screen-quad setup this file already implemented in raw
 * WebGL. Taking the dependency would ship a 3D engine on every marketing route
 * to draw one gradient, so the fragment shader was lifted onto our renderer
 * instead and `three` is deliberately absent from `package.json`.
 *
 * What is OURS and must survive any future re-port: `uFlip` (the beam mirrors
 * with the LAYOUT, not the viewport), the copy-column gate, the top/bottom
 * fades, the absence of a floor term, the off-screen pause, reduced motion,
 * every fail-soft path, the DPR cap and `mix-blend-mode: screen`. Their
 * component has none of those, and each was built for a measured reason.
 *
 * Raw WebGL, deliberately. The effect is one full-screen fragment shader with
 * no geometry, no camera, no scene graph and no textures. What is below is the
 * whole renderer.
 *
 * ── ⚠️ Why `mix-blend-mode: screen` ────────────────────────────────────────
 * The reference this is modelled on paints its band opaquely over its own dot
 * field, because there its canvas owns the whole backdrop. Ours does not:
 * `CodeFieldBackground` is a `fixed inset-0 -z-10` layer under EVERY marketing
 * page, and the hero has to stay a window onto it. Under `screen`, black is the
 * identity — so the part of this canvas the ribbon does not reach composites
 * away to nothing and the code tokens read straight through it, while the light
 * ADDS to what is behind it rather than replacing it.
 *
 * That is also why the shader can safely write `alpha = 1`: measured on the
 * real page, a screen-blended opaque-black layer over the hero is a byte-for-
 * byte no-op. It only holds while no ancestor of the hero isolates blending
 * (`isolation`, a non-`none` `transform`/`filter`, `opacity < 1`, a z-indexed
 * position). If one ever does, this canvas will stamp a black rectangle over
 * the field instead of a ribbon — that is the symptom to look for, and the fix
 * is to un-isolate the ancestor, not to change the blend mode.
 *
 * ── Cost ───────────────────────────────────────────────────────────────────
 * One `drawArrays` of three vertices per frame, and only while the hero is on
 * screen. Off-screen the loop is cancelled outright rather than throttled, and
 * under reduced motion there is no loop at all — a single frame at `uTime = 0`,
 * because the band is texture and a blank hero is not the accessible outcome.
 * Every failure path (no WebGL, a shader that will not compile or link, a lost
 * context) degrades to painting nothing, which leaves the caller's CSS wash
 * showing. Nothing here throws.
 */

/** Standard full-screen triangle: three vertices, no index buffer, no quad seam. */
const VERTEX_SRC = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec3  uA;        // primary accent — the ribbon's dominant colour
uniform vec3  uB;        // secondary accent, blended along the band stack
uniform float uIntensity;
uniform float uFlip;     // +1 LTR, -1 RTL — mirrors the GEOMETRY and nothing else
uniform vec2  uPointer;  // eased cursor in NDC [-1,1]; (0,0) = centre / no pointer

// ── The small-text guard ───────────────────────────────────────────────────
// Up to MAX_GUARDS boxes the light is held out of, measured from the REAL DOM
// and uploaded in layout space: (x0, x1, yTop0, yTop1), x already carrying
// uFlip so a box mirrors with the writing direction exactly as p.x does.
// uGuardCount = 0 means the measurement found nothing and the fallback column
// ramp below takes over.
#define MAX_GUARDS 8
uniform vec4  uGuard[MAX_GUARDS];
// Per-box depth: 1 = fully dark, 0 = untouched. Small text gets 1; headline-
// scale text gets a PARTIAL guard, because the rule it has to meet is 4.5:1,
// not "no light" — see GUARD_DEPTH below.
uniform float uGuardDepth[MAX_GUARDS];
uniform int   uGuardCount;

// ── Shape constants (ours) ─────────────────────────────────────────────────
// Named rather than inline so each is a single, unambiguous line to tune and
// to report. Values are the tuned outcome of the measurements in
// scratchpad/p21b and scratchpad/p23: perpendicular peak/median, copy-column
// lift, black share.
const float ROT         = 0.62;   // ~35deg — the diagonal the ribbon runs on
// ⚠️ Translates the sampled neighbourhood of the field; it is not what protects
// the copy (GATE_LO/GATE_HI do that). It decides which part of the ribbon lands
// inside the region the gates leave visible. It was -0.20 for the two-lobe
// shader P21b tuned, where the sign inverted the variant; that mechanism is
// gone with the lobes. It was +0.20 while the blunt copy-column gate was still
// in place; with the small-text guard (P23b) the visible window moved, and 0
// re-swept as the value that puts both arcs in frame.
const float BAND_OFFSET = 0.0;
// ⚠️ FALLBACK ONLY. This blunt column ramp was the gate until P23b, and it
// darkened the headline and the small copy alike — which is what cropped the
// ported ribbon into a wash. It now applies only when uGuardCount is 0, i.e.
// when the DOM measurement found nothing (markup changed, or it ran before
// layout). Losing the light is the safe failure; flooding the copy is not.
const float GATE_LO     = -0.30;  // fallback copy-column gate, layout-space p.x
const float GATE_HI     = 0.50;
// Both axes are normalised by HEIGHT (p.x is aspect-scaled, yTop is 0..1 over
// the canvas), so one feather constant is isotropic: 0.13 is ~117px on a 900px
// hero. Generous on purpose — a tight feather reads as a dark RECTANGLE laid
// over the hero, which is worse than the ramp it replaces.
const float GUARD_FEATHER = 0.13;
// ⚠️ Depth is now PER BOX and uploaded, not a single constant — the two
// typographic cases have different bars (small text 7:1, a 48-72px bold
// headline 4.5:1) and one number for both is what forced the old blunt gate.
// Small text is guarded at 1.0; the headline's depth lives in the TSX.
const float TOP_LO      = 0.02;   // dark under the navbar
// ⚠️ Was 0.42, which put the full-gain edge BELOW the headline and is why the
// headline sat in the dark. The navbar is ~64px (yTop 0.07 on a 900px hero),
// so 0.16 still clears it while opening the headline band to light.
const float TOP_HI      = 0.16;
const float BOT_HI      = 1.02;   // eases out into the CSS bottom fade
// ⚠️ Was 0.62. The stats block is now guarded by its own measured box rather
// than by a blanket bottom fade, so this only has to feather the canvas edge.
const float BOT_LO      = 0.80;
const float GRAIN       = 0.012;  // 8-bit dither; see below

// ── Band-field constants (ported from ColorBends) ──────────────────────────
// Their prop names, kept verbatim so the two can be diffed. Their defaults
// were a purple demo (iterations 1, noise 0.15, intensity 1.5); these are the
// tuned-for-this-hero values, reported in scratchpad/p23.
const int   BANDS       = 5;      // offset bands accumulating into the ribbon
// ⚠️ 1, which is ColorBends' own default, and NOT the "> 1" the brief asked for.
// Measured: this loop is a domain-warp RELAXATION, and every pass SMOOTHS the
// field rather than adding a band. Rendered ungated at their own settings, 1
// gives the sweeping ribbons the reference is known for, 2 blows them into
// blobs and 3+ is a dim smear. Gated, at the shipped constants, the
// perpendicular peak/median falls 49.9 -> 3.6 -> 3.2, i.e. straight through
// the 4.0 "beam, not wash" floor, and the brightest channel with it
// (231 -> 60 -> 114). The layering the brief describes comes from BANDS
// above, and is measured on its own: BANDS 1 vs 3 is a mean |dLum| of 13.3
// against a repeat floor of 0. Sheets and numbers: scratchpad/p23.
const int   ITERATIONS  = 1;      // their uIterations
const float FREQUENCY   = 1.0;    // uFrequency
// ⚠️ 1.0 is not a shrug, it is the only value that works at this seed, and at
// exactly 1.0 kMix is 1 so the m0 term in the loop is INERT: m is exactly m1.
// The general form is kept because the constant is the dial a future re-seed
// would reach for; measured at the shipped constants, 0.85 collapses the field
// to a max channel of 63 with no lit pixels at all, and 0.4 / 0.6 / 1.4 render
// pure black (max channel 1).
const float WARP        = 1.0;    // uWarpStrength
const float BAND_WIDTH  = 10.0;    // uBandWidth — higher is NARROWER
const float SCALE       = 1.6;    // uScale
const float SPEED       = 0.30;   // uSpeed
const float PARALLAX    = 0.5;    // uParallax
const float MOUSE_INFL  = 0.30;   // uMouseInfluence — see the note in the TSX
// ⚠️ The large constant is load-bearing, not a magic number to tidy away: it
// picks WHICH neighbourhood of an infinite sine field we sample, and the
// ribbon's whole character comes from that choice. Theirs is -7.56, and the
// field is not smooth in it — a sweep at 0.5 intervals crosses regions that
// render nothing at all.
const float FIELD_SEED  = -7.56;
// Their per-band coordinate step. Tiny on purpose — the visible separation
// between bands comes from the + float(i) phase inside the inner sine, not
// from this.
const float BAND_STEP   = 0.01;
// How far the last band drifts from uA toward uB.
const float COLOR_SPREAD = 0.55;
// Per-band brightness falloff. NOT in ColorBends, which sums every colour at
// full weight — see the note beside the loop for why ours needs it.
const float BAND_FALLOFF = 0.45;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

/**
 * 1 everywhere inside the box, 0 well outside, feathered OUTWARD.
 *
 * ⚠️ The ramp runs from edge - 2F to edge, i.e. entirely OUTSIDE the box,
 * so the mask is exactly 1 across the text itself. Centring the ramp on the
 * edge instead (edge - F to edge + F) looks equivalent and is not: any box
 * narrower than 2F never reaches full depth, because the two opposing ramps
 * overlap. Measured — the 12px "Building from Iraq" chip is 0.15 wide in
 * layout units against a 0.13 feather, and it was left at 4.85:1 against a
 * 7:1 bar while reading as "guarded".
 */
float guardMask(vec4 g, float px, float yTop){
  float F2 = GUARD_FEATHER * 2.0;
  float ix = smoothstep(g.x - F2, g.x, px)   * (1.0 - smoothstep(g.y, g.y + F2, px));
  float iy = smoothstep(g.z - F2, g.z, yTop) * (1.0 - smoothstep(g.w, g.w + F2, yTop));
  return ix * iy;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;

  // WebGL's origin is BOTTOM-left. Everything below reasons in LAYOUT space,
  // where 0 is the navbar and 1 is the fold — flip once, here, so no later
  // line has to remember. Reading uv.y directly is what put the full-gain end
  // of the vertical fade under the navbar and the headline.
  float yTop = 1.0 - uv.y;
  float aspect = uRes.x / uRes.y;

  // LAYOUT space. The gates below are calibrated against THIS coordinate, so
  // it keeps its half-extent (x in [-aspect/2, aspect/2]) and its mirror.
  vec2 p = vec2(uv.x - 0.5, 0.5 - uv.y);   // +y is DOWN, matching yTop
  p.x *= aspect;
  p.x *= uFlip;

  float t = uTime * SPEED;

  // ── Band field ───────────────────────────────────────────────────────────
  // ⚠️ Its constants were calibrated by React Bits against vUv * 2.0 - 1.0,
  // i.e. NDC extent. Our p is half that, so feeding it directly would sample
  // a 2x smaller neighbourhood of the field and halve the number of visible
  // ribbons. bp is the NDC-extent copy; p stays as the gates expect it.
  vec2 bp = p * 2.0;

  // The pointer in the SAME space: mirrored with the layout (so the cursor
  // pulls the ribbon toward where it physically is in both writing
  // directions) and aspect-scaled (so a horizontal move counts the same as a
  // vertical one).
  vec2 ptr = vec2(uPointer.x * uFlip * aspect, uPointer.y);

  bp += ptr * PARALLAX * 0.1;

  // ⚠️ Aspect is applied BEFORE the rotation here, where ColorBends applies it
  // after. Theirs shears the field, so its "rotation" is not the on-screen
  // angle; ours is a true 35deg. It also keeps the perpendicular direction the
  // shape test derives (scratchpad/p21b/shape.mjs) correct — that derivation
  // assumes aspect-then-rotate, and would silently measure the wrong line.
  float cr = cos(ROT), sr = sin(ROT);
  vec2 rp  = vec2(cr * bp.x  - sr * bp.y,  sr * bp.x  + cr * bp.y);
  vec2 rpt = vec2(cr * ptr.x - sr * ptr.y, sr * ptr.x + cr * ptr.y);

  vec2 q = rp / max(SCALE, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);          // fisheye: magnify the centre, compress the edge
  q += 0.2 * cos(t) + FIELD_SEED;      // slow breathe + the seed above
  q += (rpt - rp) * MOUSE_INFL * 0.2;  // pull the field toward the cursor
  q.y += BAND_OFFSET;

  // Domain warp. This is their uIterations, and it is what turns a smooth
  // gradient into a ribbon with structure — each pass relaxes the coordinate
  // toward a sine field of itself. ITERATIONS = 1 runs none, exactly as theirs.
  for (int j = 0; j < ITERATIONS - 1; j++) {
    vec2 rr = sin(1.5 * (q.yx * FREQUENCY) + 2.0 * cos(q * FREQUENCY));
    q += (rr - q) * 0.15;
  }

  // Their warp-strength ladder, hoisted out of the loop (all three are
  // constant-folded from WARP). Below 1.0 the unwarped and warped distance
  // fields are MIXED, which is why WARP is not simply 1.0 here: at exactly 1.0
  // the m0 term drops out entirely and the ribbon loses its softer inner edge.
  float kBelow = clamp(WARP, 0.0, 1.0);
  float kMix   = pow(kBelow, 0.3);
  float gain   = 1.0 + max(WARP - 1.0, 0.0);

  vec2 sp = q;
  vec3 col = vec3(0.0);
  for (int i = 0; i < BANDS; ++i) {
    sp -= BAND_STEP;
    float fi = float(i);
    vec2 r = sin(1.5 * (sp.yx * FREQUENCY) + 2.0 * cos(sp * FREQUENCY));
    float m0 = length(r + sin(5.0 * r.y * FREQUENCY - 3.0 * t + fi) / 4.0);
    vec2 warped = sp + (r - sp) * kBelow * gain;
    float m1 = length(warped + sin(5.0 * warped.y * FREQUENCY - 3.0 * t + fi) / 4.0);
    float m = mix(m0, m1, kMix);
    float w = 1.0 - exp(-BAND_WIDTH / exp(BAND_WIDTH * m));
    // Our two-colour accent stands in for their uColors[] array: band 0 is the
    // variant's primary and the stack drifts toward the secondary, so the
    // ribbon reads as one light with depth rather than N separate colours.
    //
    // ⚠️ BAND_FALLOFF has no counterpart in ColorBends, which sums every colour
    // at full weight, and it is what lets COLOR_SPREAD be large enough to SEE.
    // The two brand accents are not interchangeable: teal's green channel is
    // 0.73 against purple's 0.20, so an evenly-weighted stack makes the purple
    // hero read TEAL — measured, the (R+B) > 3G check on /tourscope fails at
    // 0.85 at some instants of the cycle with spread 1.0 and no falloff. Dimming
    // later bands keeps the fringe colour visible while the primary keeps the
    // page's identity. It is continuous with the shader this replaced, whose
    // secondary lobe carried a hard-coded * 0.65.
    //
    // ⚠️ max(1.0, ...) or BANDS = 1 divides by zero, every channel goes NaN and
    // the whole canvas renders BLACK — measured, and silent (it compiles and
    // links fine). A single band is a legitimate thing to want to test.
    col += mix(uA, uB, fi * COLOR_SPREAD / max(1.0, float(BANDS - 1))) * w * pow(BAND_FALLOFF, fi);
  }
  col = clamp(col, 0.0, 1.0);

  // ── Hold the SMALL TEXT dark, and only the small text ────────────────────
  // The headline is 48-72px bold and reads fine over light; the subhead, the
  // stat block, the chips and the footnote do not. p.x already carries uFlip
  // and so do the uploaded boxes, so this follows the LAYOUT in both locales
  // instead of the viewport.
  //
  // ⚠️ min() rather than a product: two boxes that overlap must not darken
  // twice as hard as one, or the seam between them becomes a visible bar.
  if (uGuardCount > 0) {
    float guard = 1.0;
    for (int i = 0; i < MAX_GUARDS; i++) {
      if (i >= uGuardCount) break;
      guard = min(guard, 1.0 - uGuardDepth[i] * guardMask(uGuard[i], p.x, yTop));
    }
    col *= guard;
  } else {
    col *= smoothstep(GATE_LO, GATE_HI, p.x);
  }

  // Dark under the navbar, easing out into the CSS bottom fade.
  // ⚠️ NO floor term. smoothstep(...) * 0.6 + 0.4 made every pixel at least
  // 40% lit, so the field could never reach black and the ribbon had nothing
  // to be brighter than — the single biggest reason this read as fog.
  col *= smoothstep(TOP_LO, TOP_HI, yTop);
  col *= smoothstep(BOT_HI, BOT_LO, yTop);

  // Grain. Without it an 8-bit display bands this gradient visibly.
  // ⚠️ Ours, not theirs: ColorBends defaults uNoise to 0.15, twelve times this
  // and enough to lift the field off true black everywhere — which is the one
  // thing the "black >= 8%" measurement exists to prevent.
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * GRAIN;

  gl_FragColor = vec4(col * uIntensity, 1.0);
}
`;

/**
 * Overall gain on the ribbon.
 *
 * ⚠️ This was 0.32 while the shader produced a full-frame FOG, and the low
 * value was the only thing keeping body copy legible — the light covered the
 * copy, so gain and contrast were the same dial. The shape work severed that
 * link: `GATE_LO`/`GATE_HI` hold the copy column dark in BOTH writing
 * directions, so contrast stopped responding to gain at all.
 *
 * ⚠️ Above 1.0 ON PURPOSE, which is new. The band sum is clamped to 1.0 before
 * this multiplies, so up to 1.0 the output ceiling is `INTENSITY * 255` and
 * nothing ever reaches white; the result is an evenly-lit ribbon. The look
 * being ported is not that — ColorBends' arcs have a BLOWN core against black,
 * and overdriving is what produces one. At 1.9 roughly 7% of the frame sits on
 * the framebuffer ceiling at the worst instant, and that 7% is the core.
 *
 * ⚠️ It is also the coverage dial. `p21/verify.mjs` requires more than 200,000
 * non-black pixels (16.5% of the canvas) and a sharp field is close to that
 * floor, because narrowing the arcs is what raised the peak/median. Overdriving
 * lifts the arcs' skirts back over the 8/255 threshold without widening them:
 * measured at the shipped constants, 1.0 -> 1.5 -> 1.9 moves coverage
 * 13.96% -> 17.19% -> 18.93% while peak/median goes 98.6 -> 138.4 -> 165.6.
 * Both improve together, which is why this is not simply "turned up".
 */
const INTENSITY = 1.90;

/**
 * Retina is worth it for a gradient this large; 3x is not. The shader is
 * fill-rate bound, so the cost is linear in pixels and a 3x phone would be
 * paying 2.25x for a difference nobody can see in a soft glow.
 */
const MAX_DPR = 2;

/**
 * How fast the eased pointer chases the real one, per second. ColorBends uses
 * 8 and a `min(1, dt * k)` lerp; the same here. Easing rather than snapping is
 * what keeps a fast flick from tearing the ribbon sideways in one frame.
 */
const POINTER_EASE = 8;

/**
 * The same gate `CodeFieldBackground` puts on its pointer listener: a coarse
 * pointer can never hover, so on a phone no listener is attached at all and
 * the ribbon renders at `uPointer = (0, 0)`.
 */
const INTERACTIVE = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

/** Mirrors `#define MAX_GUARDS` in the shader. Changing one changes both. */
const MAX_GUARDS = 8;

/**
 * How hard the light is held off HEADLINE-scale text.
 *
 * ⚠️ Not 1.0, and not 0. The brief for this band is that a 48-72px bold
 * headline may take light — that is the whole reason the blunt copy-column
 * gate was replaced — but it still has to clear 4.5:1. Measured with no
 * headline guard at all, the ARABIC desktop headline fell to 1.43:1: in RTL
 * the mirrored arc lands on the copy column, and its blown core sat straight
 * across the 72px word. LTR passed at 5.84 on the same frame, so testing one
 * locale would have shipped it.
 *
 * ⚠️ The depth sweep must run over a FULL cycle — ~21s, the period of the
 * field's slowest term (2*pi / SPEED). Over a 5s window this same constant
 * measured 7.62 at 0.62 and looked comfortable; over 22s it is 3.78 and fails.
 * 0.85 measures 6.40 (Arabic desktop, worst instant) against the 4.5 bar.
 *
 * It is NOT the old gate by another name: it darkens the text's own box plus a
 * feather, so the light still crosses the gaps between the headline lines and
 * the open band above the CTAs, which the copy-column ramp flattened.
 */
const HEADLINE_GUARD_DEPTH = 0.85;

/** Small text is protected outright; its bar is 7:1. */
const SMALL_GUARD_DEPTH = 1.0;

/**
 * The type-size line between "reads fine over light" and "does not".
 *
 * ⚠️ Keyed on COMPUTED FONT SIZE, not on a selector list. `HeroBackground` is
 * mounted on nine different pages whose heroes share no markup, so a selector
 * gate would protect the homepage and silently protect nothing on the other
 * eight. The rule the guard encodes is a typographic one — a 56px bold
 * headline survives a beam crossing it, a 16px paragraph does not — so the
 * measurement is of the thing the rule is actually about.
 */
const SMALL_TEXT_PX = 28;

/**
 * A background this opaque means the text is sitting on its own card, not on
 * the page ground, so the band behind it cannot touch its contrast.
 *
 * ⚠️ Without this test the product mock is the single largest block of small
 * text in the hero, and guarding it would black out exactly the region the
 * beam is supposed to fill.
 */
const OPAQUE_BG_ALPHA = 0.35;

/** Vertical gap under which two guarded boxes are merged into their union. */
const GUARD_MERGE_GAP_PX = 28;

/**
 * No depth, no stencil, no antialiasing: there is exactly one triangle and it
 * has no visible edges. `powerPreference: "low-power"` keeps a laptop on its
 * integrated GPU for what is a background flourish.
 */
const GL_ATTRS: WebGLContextAttributes = {
  alpha: true,
  depth: false,
  stencil: false,
  antialias: false,
  powerPreference: "low-power",
};

/** A box in the shader's layout space: x already flipped, y in yTop units. */
interface GuardBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** 1 = fully dark inside, 0 = untouched. */
  depth: number;
}

/**
 * Collect the hero's at-risk text and project it into layout space, each box
 * carrying the depth its typographic case earns.
 *
 * Returns `[]` when nothing qualifies, which the shader reads as "fall back to
 * the column ramp" — the conservative failure, not the flooded one.
 */
function measureTextGuards(canvas: HTMLCanvasElement, flip: number): GuardBox[] {
  const root = canvas.closest("section") ?? canvas.parentElement?.parentElement;
  if (!root) return [];
  const box = canvas.getBoundingClientRect();
  if (!box.width || !box.height) return [];
  const aspect = box.width / box.height;

  const rects: { l: number; r: number; t: number; b: number; small: boolean }[] = [];
  for (const el of Array.from(root.querySelectorAll<HTMLElement>("*"))) {
    // Decorative layers (this canvas among them) carry no reader-facing text.
    if (el.closest('[aria-hidden="true"]')) continue;
    // The CTAs are excluded by the brief: they are buttons, with their own
    // fill and border doing the contrast work.
    if (el.closest("a, button, [role='button'], input, textarea, select")) continue;

    // Only elements holding their OWN text — otherwise every wrapper up the
    // tree contributes its (much larger) box and the guard swallows the hero.
    let own = "";
    for (const n of Array.from(el.childNodes)) {
      if (n.nodeType === Node.TEXT_NODE) own += n.textContent ?? "";
    }
    if (own.trim().length < 2) continue;

    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) continue;
    // Headline-scale text is not skipped any more — it is guarded PARTIALLY.
    const isSmall = parseFloat(cs.fontSize) < SMALL_TEXT_PX;

    // Text on an opaque ancestor is already protected by that ancestor.
    let onCard = false;
    for (let a: HTMLElement | null = el; a && a !== root; a = a.parentElement) {
      const acs = getComputedStyle(a);
      if (acs.backgroundImage !== "none") { onCard = true; break; }
      const m = acs.backgroundColor.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const parts = m[1].split(",").map((v) => parseFloat(v));
        const alpha = parts.length > 3 ? parts[3] : 1;
        if (alpha > OPAQUE_BG_ALPHA) { onCard = true; break; }
      }
    }
    if (onCard) continue;

    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 6) continue;
    // Clip to the canvas; text scrolled out of the hero is not our problem.
    const l = Math.max(r.left, box.left), rt = Math.min(r.right, box.right);
    const t = Math.max(r.top, box.top), b = Math.min(r.bottom, box.bottom);
    if (rt <= l || b <= t) continue;
    rects.push({ l, r: rt, t, b, small: isSmall });
  }
  if (!rects.length) return [];

  // Merge by vertical proximity, WITHIN a class: hero copy comes in blocks of
  // lines, and one box per LINE would blow past MAX_GUARDS on any real page.
  //
  // ⚠️ Never merge across classes. A headline box folded together with the
  // subhead under it would take one depth for both — either the headline goes
  // black (losing the whole point) or the subhead stops being protected.
  rects.sort((a, b) => a.t - b.t);
  const merged: typeof rects = [];
  for (const cur of rects) {
    const last = merged[merged.length - 1];
    if (last && last.small === cur.small && cur.t - last.b < GUARD_MERGE_GAP_PX) {
      last.l = Math.min(last.l, cur.l); last.r = Math.max(last.r, cur.r);
      last.t = Math.min(last.t, cur.t); last.b = Math.max(last.b, cur.b);
    } else merged.push({ ...cur });
  }
  // Still too many: fold the closest SAME-CLASS neighbours until it fits,
  // rather than dropping any — a dropped box is unguarded text. If no
  // same-class pair is left, drop the shallowest-guarded (headline) box, since
  // its bar is the one with margin.
  while (merged.length > MAX_GUARDS) {
    let bestI = -1, bestGap = Infinity;
    for (let i = 0; i < merged.length - 1; i++) {
      if (merged[i].small !== merged[i + 1].small) continue;
      const gap = merged[i + 1].t - merged[i].b;
      if (gap < bestGap) { bestGap = gap; bestI = i; }
    }
    if (bestI < 0) {
      const idx = merged.findIndex((m) => !m.small);
      merged.splice(idx >= 0 ? idx : merged.length - 1, 1);
      continue;
    }
    const a = merged[bestI], b = merged[bestI + 1];
    merged.splice(bestI, 2, {
      l: Math.min(a.l, b.l), r: Math.max(a.r, b.r),
      t: Math.min(a.t, b.t), b: Math.max(a.b, b.b), small: a.small,
    });
  }

  // Into layout space. x is centred, aspect-scaled and mirrored exactly as
  // `p.x` is in the shader; y is yTop, 0 at the top of the canvas.
  return merged.map((m) => {
    const ax = ((m.l - box.left) / box.width - 0.5) * aspect * flip;
    const bx = ((m.r - box.left) / box.width - 0.5) * aspect * flip;
    return {
      x0: Math.min(ax, bx),
      x1: Math.max(ax, bx),
      y0: (m.t - box.top) / box.height,
      y1: (m.b - box.top) / box.height,
      depth: m.small ? SMALL_GUARD_DEPTH : HEADLINE_GUARD_DEPTH,
    };
  });
}

export function AuroraBand({ variant = "teal" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // A WebGL2 context is a structural superset of WebGL1 for the calls below,
    // and the shaders are GLSL ES 1.00 (no `#version`), which WebGL2 accepts —
    // so one code path serves both and the cast costs nothing.
    const gl = (canvas.getContext("webgl2", GL_ATTRS) ??
      canvas.getContext("webgl", GL_ATTRS)) as WebGLRenderingContext | null;
    if (!gl) return;

    function compile(type: number, src: string): WebGLShader | null {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    const program = vs && fs ? gl.createProgram() : null;
    if (!vs || !fs || !program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    // Detached and freed either way: the linked program holds its own copy.
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uPointer = gl.getUniformLocation(program, "uPointer");
    const uGuard = gl.getUniformLocation(program, "uGuard[0]");
    const uGuardDepth = gl.getUniformLocation(program, "uGuardDepth[0]");
    const uGuardCount = gl.getUniformLocation(program, "uGuardCount");

    // The variant swaps which accent leads, so the purple hero is the same
    // ribbon wearing the other brand colour rather than a second shader.
    const [a, b] =
      variant === "purple"
        ? [TS_PURPLE_GLOW_UNIT, CS_TEAL_GLOW_UNIT]
        : [CS_TEAL_GLOW_UNIT, TS_PURPLE_GLOW_UNIT];
    gl.uniform3fv(gl.getUniformLocation(program, "uA"), a);
    gl.uniform3fv(gl.getUniformLocation(program, "uB"), b);
    gl.uniform1f(gl.getUniformLocation(program, "uIntensity"), INTENSITY);
    gl.uniform2f(uPointer, 0, 0);

    // ── Writing direction ──────────────────────────────────────────────────
    // The ribbon and the dark gate it leaves for the copy are anchored to the
    // LAYOUT, not the viewport. Read from the nearest `[dir]` ancestor and fall
    // back to `<html dir>`, which this `[locale]` app sets per route.
    //
    // ⚠️ Mirrored by negating `p.x` INSIDE the shader, before the rotation —
    // deliberately not by negating ROT (the field would then animate
    // backwards too) and not by a CSS `scaleX(-1)` on the canvas (which would
    // mirror the grain along with everything else). Negating p.x is the one
    // place that mirrors the geometry and nothing else.
    //
    // Read once at setup: switching locale is a route change, which remounts
    // this tree, so there is no live `dir` flip to track.
    const dir =
      canvas.closest("[dir]")?.getAttribute("dir") ??
      document.documentElement.getAttribute("dir") ??
      "ltr";
    const flip = dir.toLowerCase() === "rtl" ? -1 : 1;
    gl.uniform1f(gl.getUniformLocation(program, "uFlip"), flip);

    let raf = 0;
    let elapsed = 0;
    let last = 0;
    let lost = false;

    // ── Pointer state ──────────────────────────────────────────────────────
    // Target is where the cursor is; current chases it. Both in NDC, both zero
    // when there is no pointer — which is also what a phone, a reduced-motion
    // reader and the very first frame all get.
    let ptrTargetX = 0;
    let ptrTargetY = 0;
    let ptrX = 0;
    let ptrY = 0;

    /**
     * Size the backing store and upload the viewport + `uRes`.
     *
     * ⚠️ The upload is UNCONDITIONAL, not gated on the size having changed.
     * This effect re-runs whenever `reduced` settles after hydration, and on
     * that second pass the canvas is already the right size — so a
     * change-gated version would hand the freshly linked program a `uRes` of
     * `vec2(0.0)`, and the shader's first line divides by it. The result is a
     * uniformly black band, on exactly the run a reduced-motion reader gets.
     *
     * Returns false when the element has no layout box yet; the ResizeObserver
     * calls back with the real size a frame later.
     */
    function applySize(): boolean {
      if (!gl || !canvas) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      // The canvas's own box, not `window.innerHeight`: the hero is
      // `min-h-[100dvh]` and routinely taller than the viewport.
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (!cssW || !cssH) return false;
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      uploadGuards();
      return true;
    }

    /**
     * Measure the hero's small text and upload the boxes.
     *
     * ⚠️ Called from `applySize`, which already runs at setup and on every
     * resize — the same events that can move the text. Measuring once at mount
     * would leave the guard pinned to the boxes as they were before the web
     * font swapped in, which shifts line heights and would slide the beam onto
     * the subhead.
     */
    function uploadGuards() {
      if (!gl || !canvas) return;
      let boxes: GuardBox[] = [];
      try {
        boxes = measureTextGuards(canvas, flip);
      } catch {
        // A measurement that throws must fall back to the column ramp, not
        // take the hero down with it.
        boxes = [];
      }
      const flat = new Float32Array(MAX_GUARDS * 4);
      const depths = new Float32Array(MAX_GUARDS);
      for (let i = 0; i < boxes.length && i < MAX_GUARDS; i++) {
        flat[i * 4] = boxes[i].x0;
        flat[i * 4 + 1] = boxes[i].x1;
        flat[i * 4 + 2] = boxes[i].y0;
        flat[i * 4 + 3] = boxes[i].y1;
        depths[i] = boxes[i].depth;
      }
      gl.uniform4fv(uGuard, flat);
      gl.uniform1fv(uGuardDepth, depths);
      gl.uniform1i(uGuardCount, Math.min(boxes.length, MAX_GUARDS));
    }

    function render(time: number) {
      if (!gl) return;
      gl.uniform1f(uTime, time);
      gl.uniform2f(uPointer, ptrX, ptrY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now: number) {
      // Elapsed time accumulates only while the loop is actually running, so
      // scrolling the hero away and back resumes the ribbon where it paused
      // instead of jump-cutting it forward by the whole time it was hidden.
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      elapsed += dt;
      last = now;
      // Ease toward the cursor rather than snapping to it. `dt` is the same
      // clamped delta the clock uses, so a stalled tab cannot teleport it.
      const k = Math.min(1, dt * POINTER_EASE);
      ptrX += (ptrTargetX - ptrX) * k;
      ptrY += (ptrTargetY - ptrY) * k;
      render(elapsed);
      raf = requestAnimationFrame(frame);
    }

    // ── Pointer listener ───────────────────────────────────────────────────
    // ⚠️ Same discipline as `HeroBackground`: `getBoundingClientRect` is a
    // layout read, so it is CACHED and invalidated by scroll/resize rather
    // than called inside the move handler — otherwise every frame the cursor
    // is over the hero forces a synchronous reflow. And no listener at all
    // under reduced motion or on a coarse pointer, where there is nothing to
    // track and no loop to consume it.
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
      if (!canvas) return;
      if (rectStale || !rect) {
        rect = canvas.getBoundingClientRect();
        rectStale = false;
      }
      const w = rect.width || 1;
      const h = rect.height || 1;
      ptrTargetX = ((e.clientX - rect.left) / w) * 2 - 1;
      ptrTargetY = -(((e.clientY - rect.top) / h) * 2 - 1);
    }

    let listening = false;
    function attachPointer() {
      if (listening || !interactive) return;
      listening = true;
      rectStale = true;
      window.addEventListener("mousemove", onPointerMove);
      window.addEventListener("scroll", invalidateRect, { passive: true });
      window.addEventListener("resize", invalidateRect);
    }
    function detachPointer() {
      if (!listening) return;
      listening = false;
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("scroll", invalidateRect);
      window.removeEventListener("resize", invalidateRect);
      // Ease home rather than staying bent by wherever the cursor was when the
      // hero left the viewport — otherwise the ribbon is still deformed by a
      // stale position on the way back up.
      ptrTargetX = 0;
      ptrTargetY = 0;
    }

    function start() {
      if (raf || lost || reduced) return;
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

    // The first frame — and, under reduced motion, the ONLY frame. Painted
    // here rather than left to the observer's initial callback so it does not
    // depend on when that callback happens to land.
    if (applySize()) render(0);

    const observed = canvas.parentElement ?? canvas;
    const ro = new ResizeObserver(() => {
      if (applySize() && !raf) render(reduced ? 0 : elapsed);
    });
    ro.observe(observed);

    // The hero is set in a web font. Until it swaps in, every measured box is
    // the fallback face's metrics; the ResizeObserver does not always fire for
    // a swap that changes no ancestor's size.
    let fontsDone = false;
    document.fonts?.ready.then(() => {
      if (fontsDone) return;
      fontsDone = true;
      uploadGuards();
      if (!raf) render(reduced ? 0 : elapsed);
    }).catch(() => {});

    // Same gate `HeroBackground` puts on its pointer listeners: a shader
    // repainting a hero the reader scrolled past ten screens ago is pure waste.
    let io: IntersectionObserver | null = null;
    if (!reduced) {
      io = new IntersectionObserver(([entry]) =>
        entry.isIntersecting ? start() : stop(),
      );
      io.observe(canvas);
    }

    // No `preventDefault()`: that is what marks a context restorable, and we do
    // not rebuild the program on `webglcontextrestored`. Claiming a restore we
    // will not perform leaves the canvas blank AND holding the context. `lost`
    // keeps the observer from scheduling frames into a dead context.
    const onLost = () => {
      lost = true;
      stop();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      fontsDone = true;   // the fonts.ready callback may still be pending
      io?.disconnect();
      ro.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      stop();
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      // ⚠️ Deliberately NOT `WEBGL_lose_context.loseContext()`. Cleanup does not
      // only run on unmount — this effect re-runs whenever `reduced` settles
      // from its hydration-safe `false` to the reader's real setting, and
      // `getContext` hands back the SAME context object for a given canvas. So
      // losing it here poisoned the re-run: every `createShader` returned null,
      // the fail-soft path took over, and the band never painted for ANY
      // reduced-motion reader. Measured `isContextLost() === true` with a
      // 300x150 default buffer and zero draws. Dropping the canvas is what
      // frees the context; deleting the program and buffer is the rest.
    };
  }, [variant, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
