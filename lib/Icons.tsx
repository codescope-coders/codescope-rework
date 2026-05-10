// lib/icons.tsx

export const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 13 11" fill="none" aria-hidden>
    <path d="M1.5 5.5L5 9L11.5 1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ScrollArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M8 3V13M4 9L8 13L12 9" />
  </svg>
);

export const ClockIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <circle cx="8" cy="8" r="6.5" /><path d="M8 4.5V8L10 9.5" />
  </svg>
);

export const CardIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M2 6.5H14M5.5 9.5H8" />
  </svg>
);

export const GlobeIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <circle cx="8" cy="8" r="6.5" />
    <path d="M1.5 8H14.5M8 1.5Q4 8 8 14.5Q12 8 8 1.5" />
  </svg>
);

export const TargetIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <circle cx="8" cy="8" r="6.5" /><circle cx="8" cy="8" r="2.5" />
  </svg>
);

export const ServerIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <rect x="2" y="3" width="12" height="4" rx="1" />
    <rect x="2" y="9" width="12" height="4" rx="1" />
    <circle cx="4.5" cy="5" r=".5" fill="currentColor" />
    <circle cx="4.5" cy="11" r=".5" fill="currentColor" />
  </svg>
);

export const GradCapIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M2 6L8 3L14 6L8 9Z" /><path d="M5 7.5V10.5Q8 12 11 10.5V7.5" />
  </svg>
);

// Flow step icons
export const FlowBookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <rect x="2" y="2" width="10" height="10" rx="2" />
    <path d="M5 7h4M7 5v4" strokeLinecap="round" />
  </svg>
);
export const FlowPayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <rect x="2" y="3" width="10" height="8" rx="1.5" />
    <path d="M2 6.5h10" strokeLinecap="round" />
  </svg>
);
export const FlowConfirmIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <circle cx="7" cy="7" r="5" />
    <path d="M4.5 7l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const FlowDocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M2.5 4h9M2.5 7h6M2.5 10h4" strokeLinecap="round" />
  </svg>
);
export const FlowFollowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <circle cx="7" cy="7" r="5" />
    <path d="M7 4.5v2.5l1.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Tourscope wordmark SVG path data (shared between Nav & Footer)
export const TourScopePath = ({ height = 19 }: { height?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 507.02 53.74" height={height} aria-label="Tourscope">
    <polygon fill="#6f00ff" points="203.46 .72 203.31 .72 190.39 .72 190.24 .72 190.24 12.74 190.24 13.8 190.24 20.34 190.24 26.87 190.24 33.41 190.39 33.41 203.31 33.41 203.46 33.41 216.54 33.41 216.54 39.95 203.46 39.95 190.39 39.95 190.39 53.02 203.46 53.02 216.54 53.02 229.61 53.02 229.61 46.48 229.61 39.95 229.61 33.41 229.61 20.34 216.54 20.34 203.46 20.34 203.31 20.34 203.31 13.8 203.46 13.8 216.54 13.8 229.61 13.8 229.61 .72 216.54 .72 203.46 .72"/>
    <polygon fill="#6f00ff" points="249.92 .72 236.84 .72 236.84 12.74 236.84 13.8 236.84 20.34 236.84 26.87 236.84 33.41 236.88 33.41 236.88 39.95 236.84 39.95 236.84 53.02 249.92 53.02 262.99 53.02 276.06 53.02 276.06 39.95 262.99 39.95 249.96 39.95 249.96 33.41 249.92 33.41 249.92 26.87 249.92 20.34 249.92 13.8 262.99 13.8 276.06 13.8 276.06 .72 262.99 .72 249.92 .72"/>
    <path fill="#6f00ff" d="M435.06.72h-13.9v32.69h.04v6.54h-.04v13.07h13.07v-6.54h.04v-13.07h-.04v-.02h26.97V.72h-26.15ZM448.13,20.31h-13.9v-6.52h13.9v6.52Z"/>
    <polygon fill="#6f00ff" points="493.94 13.8 507.02 13.8 507.02 .72 493.94 .72 480.87 .72 467.79 .72 467.79 13.8 467.79 20.34 467.79 26.87 467.79 33.41 467.83 33.41 467.83 39.95 467.79 39.95 467.79 53.02 480.87 53.02 493.94 53.02 507.02 53.02 507.02 39.95 493.94 39.95 480.91 39.95 480.91 33.41 493.94 33.41 507.02 33.41 507.02 20.34 493.94 20.34 480.87 20.34 480.87 13.8 493.94 13.8"/>
    <path fill="#6f00ff" d="M280.37,52.88h134.64V.86h-134.64v52.02ZM292.73,22.45l109.92-7.87v24.59l-109.92-7.82v-8.9Z"/>
    <path fill="#6f00ff" d="M17.29,6.81H0V.84h40.89v5.98h-17.23v46.16h-6.36V6.81Z"/>
    <path fill="#6f00ff" d="M39.47,26.81v-.06c0-14.85,9.84-26.74,25.65-26.74h.06c15.81,0,25.71,11.89,25.71,26.74v.06c-.06,14.79-9.96,26.94-25.71,26.94h-.06c-15.75,0-25.65-12.15-25.65-26.94ZM65.25,47.51c11.38,0,19.22-9,19.22-20.76v-.06c0-11.83-7.71-20.44-19.22-20.44h-.13c-11.57,0-19.29,8.61-19.29,20.44v.06c.06,11.76,7.78,20.76,19.29,20.76h.13Z"/>
    <path fill="#6f00ff" d="M94.57,32.72V.84h6.3v30.21c0,11.57,4.44,16.46,15.11,16.46s15.11-4.89,15.11-16.46V.84h6.3v31.89c0,13.5-6.17,21.02-21.41,21.02s-21.41-7.52-21.41-21.02Z"/>
    <path fill="#6f00ff" d="M163.04,31.37h-11.89v21.6h-6.3V.84h19.67c12.47,0,18.32,5.91,18.32,14.85v.06c0,7.84-4.69,13.56-13.11,15.17l14.27,22.05h-7.07l-13.89-21.6ZM151.14,25.78h14.01c6.88,0,11.25-3.6,11.25-9.77v-.06c0-6.11-4.44-9.19-11.25-9.19h-14.01v19.03Z"/>
  </svg>
);