"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { CS_TEAL_GLOW } from "@/lib/colors";

const T = CS_TEAL_GLOW;

// Geometry derived from public/Branding/logomark.svg (viewBox 265.83×102.72), scaled to 500×200.
// Outer rect: 0,0 → 500,200
// Lens parallelogram: TL(46,83) TR(454,53) BR(454,147) BL(46,117)
// Optical centre: (250, 100)
const CX = 250;
const CY = 100;
const LENS = "46,83 454,53 454,147 46,117";

export function ScopeReticle({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  // The two pulses below loop forever; under reduced motion they hold their
  // resting frame so the reticle still reads as a HUD, just a still one.
  const reduced = useReducedMotionSafe();

  return (
    <svg
      viewBox="0 0 500 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Glow filter for the lens outline */}
        <filter id={`gf-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Ambient radial glow behind lens centre */}
        <radialGradient id={`bg-${uid}`} cx="52%" cy="50%" r="40%">
          <stop offset="0%"   stopColor={T} stopOpacity="0.07" />
          <stop offset="100%" stopColor={T} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow */}
      <rect x="0" y="0" width="500" height="200" fill={`url(#bg-${uid})`} />

      {/* ── Outer frame ───────────────────────────────────── */}
      <rect x="1" y="1" width="498" height="198"
        stroke={T} strokeOpacity="0.08" strokeWidth="1" />

      {/* Corner brackets */}
      <path d="M 24 1 L 1 1 L 1 24"          stroke={T} strokeOpacity="0.38" strokeWidth="1.5" />
      <path d="M 476 1 L 499 1 L 499 24"      stroke={T} strokeOpacity="0.38" strokeWidth="1.5" />
      <path d="M 24 199 L 1 199 L 1 176"      stroke={T} strokeOpacity="0.38" strokeWidth="1.5" />
      <path d="M 476 199 L 499 199 L 499 176" stroke={T} strokeOpacity="0.38" strokeWidth="1.5" />

      {/* Edge tick marks */}
      {[100, 200, 300, 400].map((x) => (
        <g key={x}>
          <line x1={x} y1="1"   x2={x} y2="9"   stroke={T} strokeOpacity="0.18" strokeWidth="1" />
          <line x1={x} y1="191" x2={x} y2="199" stroke={T} strokeOpacity="0.18" strokeWidth="1" />
        </g>
      ))}
      {[66, 133].map((y) => (
        <g key={y}>
          <line x1="1"   y1={y} x2="9"   y2={y} stroke={T} strokeOpacity="0.18" strokeWidth="1" />
          <line x1="491" y1={y} x2="499" y2={y} stroke={T} strokeOpacity="0.18" strokeWidth="1" />
        </g>
      ))}

      {/* ── Scope lens parallelogram ──────────────────────── */}
      <polygon points={LENS} fill={T} fillOpacity="0.025" />
      <polygon points={LENS}
        stroke={T} strokeOpacity="0.52" strokeWidth="1.5"
        filter={`url(#gf-${uid})`} />

      {/* Left / right vertical edge accents */}
      <line x1="46"  y1="83"  x2="46"  y2="117" stroke={T} strokeOpacity="0.52" strokeWidth="2" />
      <line x1="454" y1="53"  x2="454" y2="147" stroke={T} strokeOpacity="0.52" strokeWidth="2" />

      {/* Pulsing optical centre dot */}
      <motion.circle
        cx={CX} cy={CY} r="2.5" fill={T}
        animate={reduced ? undefined : { r: [2.5, 4.5, 2.5], opacity: [1, 0.4, 1] }}
        transition={reduced ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── HUD readout labels ────────────────────────────── */}
      <text x="8"   y="14"  fill={T} fillOpacity="0.2" fontSize="6" fontFamily="monospace" letterSpacing="1.2">CS·01</text>
      <text x="492" y="14"  fill={T} fillOpacity="0.2" fontSize="6" fontFamily="monospace" textAnchor="end">∞  0.0m</text>
      <text x="8"   y="194" fill={T} fillOpacity="0.2" fontSize="6" fontFamily="monospace">47.2° N</text>
      <text x="492" y="194" fill={T} fillOpacity="0.2" fontSize="6" fontFamily="monospace" textAnchor="end">LOCKED</text>

      {/* Blinking status dot */}
      <motion.circle cx="484" cy="9" r="2.5" fill={T}
        animate={reduced ? undefined : { opacity: [1, 0.12, 1] }}
        transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}
