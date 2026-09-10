# Codescope dashboard design refinement

The internal Follow-up dashboard now shares Codescope’s teal identity and Geist / IBM Plex Sans Arabic typography. This is scoped to dashboard surfaces; the public mobile refinements, SEO work, authentication, permission checks, and data operations are preserved.

## Implemented

- Separate light and dark canvas, surface, border, text, and teal tokens. The light theme uses deeper teal for readable white labels; dark mode uses brighter teal with dark labels. Native form controls follow the chosen color scheme.
- Reuse the existing per-device theme preference and switch. The switch exposes its pressed state and a localized action tooltip.
- Consistent rounded buttons, single-border cards and tables, clearer page headings, and more legible statistic labels and values.
- Website fonts on the shell, dialogs, and collapsed navigation flyouts. Fixed flyouts reading an unset theme from the document instead of the dashboard store.
- Dynamic viewport height, contained table scrolling, larger touch targets, and 16px mobile fields to avoid iOS form zoom.
- Mobile dropdowns stay within the viewport. Removed the header blur that incorrectly established a containing block for fixed dropdowns.
- Mobile drawer focus containment, Escape dismissal, focus restoration, and inert background/closed navigation. Command-palette keyboard shortcut closes the drawer first.
- Keyboard activation for clickable statistics, current-page indicators, expanded navigation state, and localized dialog close controls.
- Respect reduced motion through MotionConfig and dashboard-scoped CSS.

## Validation and limits

- `npx tsc --noEmit`, production build, scoped ESLint, and `git diff --check` passed. The production build retains existing workspace-root and middleware-convention warnings.
- Reviewed desktop light and dark appearance visually in Chrome.
- Used a temporary development-only component preview containing the actual shell and shared UI, with sample data and disabled queries. Checked English and Arabic at a 320px viewport, RTL fonts, contained table overflow, menu bounds, and mobile form sizes.
- Checked theme persistence after reload, keyboard statistic activation, sidebar collapse, Escape dismissal, and dark RTL flyout/dialog styling through browser inspection.
- The temporary preview was removed before the production build. Its source is retained outside the app at `/tmp/codescope-dashboard-review/preview-source` for this local session.
- Authenticated dashboard workflow testing is still pending a signed-in local session. `/dashboard` correctly redirects unauthenticated visitors. Preview checks do not establish that backend workflows work.
- Confirmed the public Tourscope page renders with no dashboard theme surfaces.
- No production deployment or performance-score claim is made.

Implementation references: [MotionConfig reduced motion](https://motion.dev/docs/react-motion-config) and [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore).
