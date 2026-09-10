# Public website theme review — 10 September 2026

## Implemented locally

- Added a 44px light/dark control to the public header, with English and Arabic accessible labels. Dark remains the default; the public preference persists independently of the login/dashboard preference.
- Reused the installed `next-themes` provider with a custom HTML attribute and storage key. Its pre-paint script restores the preference; theme-dependent labels wait for hydration. Reference: [official next-themes documentation](https://github.com/pacocoursey/next-themes).
- Added a public-only light palette: off-white surfaces, deep green text, legible teal accents, and purple Tourscope branding. Updated menu, navigation transition grounds, pricing cards, form controls, calendar/select portals, reveal text, footer, partner logos, and focus/selection states.
- Kept dark product previews and primary action faces readable through explicit dark surface scopes. Images are not globally inverted. The homepage studio mockup gets a clean frame on the light page instead of the dark theme's feathered blend.
- Strengthened the light-theme mouse field, scope outline, local glow, and card spotlights. Canvas palette reads happen on theme changes, outside the frame loop. Existing coarse-pointer and reduced-motion behavior remains.
- Refined the light globe after visual feedback: an opaque ivory-to-sage mineral surface, deep teal continent dots, matching aircraft and travel paths, and dark teal hotel/group glyphs with a pale separating stroke. The ambient wash is quieter in light mode. Dark mode keeps its original palette. Geometry, smaller icons, rotation, hover, visibility pauses, mobile frame cap, and reduced-motion handling remain. Theme changes repaint without restarting rotation; both themes now use a single aircraft draw pass.
- Fixed long careers select placeholders expanding the mobile grid. This is scoped to public forms and does not change shared dashboard primitives or submission logic.

## Local verification

- Reviewed all eight top-level public routes: Home, Tourscope, Pricing, About, Engineering, Contact, Request a demo, and Careers. English and Arabic at 320px had no horizontal document overflow. Additional desktop and mobile visual checks covered navigation, forms, pricing, product previews, imagery, reveal text, and the globe.
- Fetched and decoded all 140 unique image assets referenced in those rendered public pages: no failed requests or decode failures; no missing `alt` attributes. This is an asset integrity check, not a claim of individual visual review of every carousel frame.
- Verified theme switching and persistence after reload in a local production build, dark restoration, light menu navigation to Pricing, and no new production browser errors during those checks. Login remained on its own theme with no public theme control or public palette scope.
- Globe visual checks covered desktop light/hover, mobile dark/light, and Arabic at 320px; outer aircraft remain visible on the light page. These are browser viewport checks, not physical iPhone performance measurements.
- Production build, TypeScript, scoped ESLint, and whitespace checks passed. Existing build warnings concern workspace lockfile inference and the deprecated middleware filename.

## Limits and follow-up

- Local careers data is unavailable, so actual job descriptions could not be inspected. The real application form was rendered in a temporary local preview to check selectors, calendar, upload presentation, both themes, and narrow layout. The preview was removed before the production build. No application, demo, contact, OTP, or file upload was submitted.
- Development HMR produced hydration warnings during edits; these did not reproduce in the checked production routes. This is not a claim that every possible application state has been exercised.
- Content and business claims were preserved. This pass verifies text presentation and contrast, not the truth of changing inventory counts or business metrics.
- Nothing was committed, pushed, or deployed. The existing development server remains available on port 3000 for phone testing.

## Button palette refinement — 11 September 2026

- Centralized public CTA colors using the existing Starfield variant/accent attributes: teal filled primary, sage outlined secondary; Tourscope uses purple filled primary and lavender secondary. Dark secondary surfaces retain depth and readable pale text.
- Applied the same primary treatment to public form submissions, careers retry/submit actions, and the menu demo link. Package radios use a distinct tinted selected state. Shared dashboard/login buttons are outside this scope.
- Kept button geometry, page handoffs, and pointer/reduced-motion gates. Filled buttons now use a quieter white rim/field; secondary buttons retain the accent field. Added consistent focus rings and theme-aware hover colors. Disabled submissions remain muted and do not run the field effect.
- Checked rendered homepage, Tourscope, Pricing, selected demo package/submit, and menu colors in the relevant themes, plus narrow Arabic Tourscope and 320px form layout. Primary resting label contrast is at least 5.59:1; checked secondary pairs exceed 7.6:1. These calculated palette ratios are not a full accessibility audit.

## Cursor code field refinement — 11 September 2026

- Expanded the response radius from 190px to 280px and increased near-pointer symbol size from a fixed 11px to up to 23px. A 42px grid leaves room for larger operators while reducing the total token count.
- Increased positional response and eased symbol size/brightness together. The previous 105px center erasure is now only 32px, so the closest enlarged symbols remain visible.
- Applied a smooth distance falloff to scale, displacement, tint, and opacity. Distant texture rests around 1.8% opacity in dark mode and 2.2% in light mode, with a much clearer teal response close to the pointer.
- Included brightness and scale in the existing settling condition, so leaving the field fades it out and a resting pointer does not keep a permanent animation loop alive. Font strings are prebuilt; theme palette reads remain outside the draw loop. Touch/reduced-motion gates remain in place.
- Visually checked actual coordinate pointer activation in both themes on the local homepage. No physical-device performance claim is made.

## Calm code texture — final direction, 11 September 2026

This replaces the larger, brighter cursor treatment above after visual feedback.

- Sparse 56px grid, 220px response radius, nearly constant 14–16px glyphs, and at most 4px displacement. Brightness carries the interaction.
- Padded, feathered exclusion zones around public headings, paragraphs, lists, and controls keep symbols out of reading and interaction areas. Hidden overlays and outgoing page copies are excluded from geometry collection.
- Content bounds are cached and refreshed on scrolling, layout/font changes, route changes, and completion of the page arrival animation. Pointer movement uses cached token clearances.
- The response fades after a short rest (700ms hold, 1800ms falloff), then the frame loop stops once the remaining movement and brightness settle. Motion easing is time-based. Coarse pointers, reduced motion, and narrow viewports do not render the cursor field.
- Visually checked light/dark open-space response, content clearance, and resting fade locally. Temporary verification attributes were removed before the production build.
