import { HeaderLogo } from "@/assets/logo/header-logo";

// The Codescope wordmark, rendered in the dark brand ink so it reads against the
// light login background. `HeaderLogo` paints with `currentColor`.
export function Brand() {
  return (
    <HeaderLogo
      className="h-6 w-auto text-secondary"
      role="img"
      aria-label="Codescope"
    />
  );
}
