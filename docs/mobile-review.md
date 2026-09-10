# Mobile refinement review

Follow-up: the public SEO work now uses stable `/ar/...` URLs instead of cookie-only language switching. See [the SEO and analytics review](seo-analytics-review.md) for the later routing, font, metadata and browser verification results. Earlier measurements below describe the mobile-refinement stage.


Reviewed 9 September 2026. Scope: the public CodeScope website, English and Arabic, including careers and the application surface. Existing mobile-menu and touch-scrolling edits were preserved.

**Implemented**

- Headers fit 320px phones, with 44px menu and language controls. The mobile menu marks the current page, contains overscroll, makes background content inert, returns keyboard focus, accommodates bottom safe areas, and unlocks scrolling when resized into desktop navigation.
- Phone hero typography, spacing, wordmark sizing and full-width 48px calls to action give the opening screen a clearer hierarchy. Above-the-fold text stays visible while JavaScript loads. The desktop identity and layouts are retained.
- Fixed overflow in the About positioning diagram and TourScope product cards. Fixed the language showcase's implicit grid column, which clipped text even though the document appeared to fit the screen. Contained product-frame glows that added horizontal overflow on tablets.
- TourScope uses scrollable pill tabs on phones and tablets, and its existing vertical navigation on desktop. Topic taps scroll smoothly using Lenis on desktop and native on-demand scrolling on touch devices; reduced-motion settings retain instant jumps. Section jumps account for the fixed navigation. Shorter section gaps reduce unnecessary scrolling without deleting product information.
- Contact and demo-request fields use 16px text on phones. Added contact autofill and email keyboard hints, improved placeholder contrast, and retained visitor-written messages when switching packages. Application form controls inherit the same mobile type safeguard.
- Footer links use a compact two-column phone layout and larger touch targets.
- Globe and mosaic decoration render at up to 30fps with a lower pixel-density cap on touch devices, and stop when the document is hidden or the scene is offscreen. Scroll text uses whole words on touch devices and omits expensive per-word glow. Magnetic buttons avoid unnecessary touch-device scroll listeners.
- Repaired FAQ animation reversal and repeated opening, including an opacity animation that could conceal reopened content.
- Removed eager downloads of unused app-shell fonts from public visits. Repacked the favicon using its existing 16, 32, 48 and 256px image payloads, preserving their pixels while shrinking the file from 168,757 to 21,981 bytes. Together, the font and favicon changes avoid about 400 KB of initial home-page downloads compared with the first production audit in this pass.
- Added localized careers error/retry states. A failed jobs request now has a clear recovery action instead of appearing empty or leaving an incomplete role page.
- Updated ESLint configuration to the installed Next.js flat-config exports so validation can run.

**Verification**

- Production build and TypeScript checks passed. ESLint passed for changed code and the new components.
- 96 Chromium checks: eight public pages × English/Arabic × 320, 375, 390, 768, 1024 and 1440px. No horizontal document overflow or offscreen header controls remained.
- Fourteen additional WebKit page checks: seven public pages in both languages at 375px. No horizontal document overflow.
- Tested menu opening, Escape, scroll unlocking, desktop resize, topic navigation, FAQ open/close/reopen and rapid reversal, locale switching, package preselection, preservation of custom messages, form validation, and success/error recovery.
- Form POST requests were intercepted with controlled responses; no real leads or messages were sent. Careers retry and the application layout were tested using controlled job data. The home headline and primary CTA were checked with JavaScript disabled.
- Browser evidence and audit scripts are in `/tmp/codescope-mobile-review` in this workspace environment.

| Mobile Lighthouse metric | First production audit in this pass | Final home-page run |
| --- | ---: | ---: |
| Performance | 74 | 85 |
| Accessibility | 100 | 100 |
| Simulated LCP | 6.1s | 4.1s |
| Total blocking time | 210ms | 20ms |
| Layout shift | 0 | 0.001 |

These are local production lab results, not field measurements or a before/after benchmark of the untouched repository. The first measurement followed the initial layout refinements. Simulated LCP remains above the 2.5s target. TourScope's larger page recorded 72 performance, 5.0s LCP, 140ms blocking time and zero layout shift before the final mobile contrast adjustment. Real-device testing and deployed field measurements remain useful, particularly for slow connections and older phones.

The live local `/api/jobs` endpoint returns HTTP 500. Its backend issue remains; the public UI now communicates the failure and offers retry. No database changes were made.

**Copy and content recommendations**

1. **Make the opening product promise shorter.** Keep the existing home headline if its story is important, but replace the long supporting paragraph with: “Launch your travel agency's booking platform under your own brand. Manage bookings, suppliers and payments in one place.” Suggested Arabic: “أطلق منصة حجز لوكالتك بعلامتك التجارية، وأدر الحجوزات والمورّدين والمدفوعات من مكان واحد.” This keeps the primary action closer to the top on short phones.

2. **Simplify the TourScope headline.** Suggested English: “Your travel business. One platform.” Suggested Arabic: “أعمال سفرك، في منصة واحدة.” Supporting copy can explain the distinction: “A branded booking website for your customers, with one dashboard for your team.” The current opening repeats the platform description, vertical count and language support before visitors reach the product.

3. **Clarify billing beside the price.** For Charter, replace “$75 per month” with “Equivalent to $75/month, billed $900 annually.” Apply the same pattern to Standard and Advanced. Consider a visible first-year total including setup: $1,400, $6,500 and $12,250 respectively, before add-ons or other applicable charges. Clarify which plans need each add-on, since insurance and eSIM appear both as included features and separately priced extensions.

4. **Resolve the company's positioning.** Home says CodeScope “builds one thing,” while Engineering asks about building the visitor's own product. If custom work is available, explain its relationship to TourScope. If the business is product-only, make the Engineering CTA a TourScope demo request. Pick one consistent spelling of CodeScope and TourScope across headings, metadata, body copy and alternative text.

5. **Describe the demo before asking for details.** “Tell us about your agency. We'll show you the booking flow and the tools your team will use.” Only promise a specific duration, response time or onboarding timeline when the team can consistently deliver it. “Let's get you set up” sounds like immediate onboarding, while the form actually sends an inquiry; “See TourScope for your agency” would set a clearer expectation.

6. **Add proof with context.** Put one approved agency story near the first product preview: the agency's starting problem, what it uses, and a measured outcome with a period and source. Date and substantiate claims such as 700+ airlines, 1.5M+ hotels, 80+ integrations and the team size. Clarify whether inventory is potentially available through suppliers or available to every package/customer.

7. **Separate the pitch from the reference material.** The English TourScope page still spans roughly 34,000px at 390px wide. The sticky pill tabs make its details easier to reach, but a shorter overview with dedicated product/reference pages would make the buying journey easier to scan. Preserve deep links when splitting it.

**Imagery recommendations**

- Lead with a genuine mobile booking flow: search, useful results, and checkout, with each screen large enough to read. Use approved demonstration data, never customer information.
- Follow with one legible agency-dashboard crop showing a useful task, such as pricing a booking or reviewing a statement. The current miniature product drawings convey breadth but their tiny text cannot explain the workflow on a phone.
- Keep the existing device composite as an overview; pair it with a focused mobile screenshot instead of asking a phone reader to inspect three devices at once.
- Add authentic team or workplace photography to About, and an approved customer image or product capture to the case study. This gives the company page evidence that the globe and ambient graphics cannot provide.
- Use consistent, intentional crops for travel imagery, supply accurate alternative text, retain explicit image dimensions, and keep below-the-fold images lazy-loaded.

**TourScope mobile hero follow-up**

The phone hero now uses a 180px wordmark, compact localized headline and introduction, and one prominent purple “Request a demo” button. The existing booking preview follows immediately; the secondary exploration link sits beneath it. Desktop copy, colors and layout remain unchanged. At 375px, the preview moved from 878px to 372px from the top in English, and from 811px to 318px in Arabic. Checked 320, 375 and 390px layouts in both languages, with desktop geometry compared at 1440px.

## Follow-up: delayed mobile menu (2026-09-10)

The reported symptom was a roughly two-second pause followed by an abrupt menu open/close and page navigation. The exact delay on the user's phone was not measured locally.

Implemented for the public Codescope/Tourscope menu:

- Keep the small menu tree mounted and animate opacity/row movement with CSS (180ms panel, 200ms rows), instead of mounting Motion controllers on each tap. The icon transitions with CSS as well. Closed/closing content is inert and hidden from assistive technology.
- Move the header backdrop filter to a separate decorative layer. The fixed menu now uses the viewport directly; WebKit establishes a fixed-position containing block even for an ancestor with `blur(0px)`.
- Focus without scrolling; avoid automatically focusing the first menu row for touch input. Preserve Escape, focus containment/restoration, scroll locking, RTL, and reduced-motion behavior.
- Show Link-owned navigation feedback outside the closing menu, so slow requests are acknowledged immediately and the state clears when Next finishes navigating.
- Add loading boundaries to the six fixed marketing routes linked from the menu. Keep careers outside those boundaries so invalid job URLs continue returning HTTP 404.
- Remove the sequential outgoing-page wait; new content has a short CSS fade on arrival.

Validation: production build, TypeScript, scoped ESLint, whitespace checks, and the full public SEO regression script passed. Browser checks covered English at 390px, Arabic at 320px, desktop navigation at 1280px, open/close intermediate opacity, Escape cleanup, route completion, and console errors. The panel starts at y=64 and fills the available viewport below the header.

A local read-only proxy delayed navigation responses by four seconds. During that simulated delay, the menu reported closed and visible "Loading page…" feedback appeared before the URL changed; the feedback disappeared once navigation completed. This is a controlled local check, not a measurement on physical Safari/Chrome or the live deployment.

References: [Next.js linking and navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating), [useLinkStatus](https://nextjs.org/docs/app/api-reference/functions/use-link-status), [WebKit fixed descendants under backdrop filters](https://bugs.webkit.org/show_bug.cgi?id=215256).

## Follow-up: native activation on iPhone (2026-09-10)

The user still reported failed/delayed taps on an iPhone Air and iPhone 17 Pro Max while desktop interactions worked. A fresh request to `https://codescope.dev/tourscope` confirmed that the previously pushed `.site-menu-panel` implementation was present; its menu JavaScript contained no old laser-sweep layer. An old deployment was therefore not established as the cause.

The mobile trigger now uses a native `details`/`summary` disclosure. Its browser-owned `open` attribute directly drives the existing CSS fade, row movement, and animated glyph. React enhances focus, Escape, and route cleanup, but opening and closing no longer require a React click handler or hydration. The sibling panel remains mounted so closing can still fade smoothly. CSS scroll locking also works before hydration. Avoided setting/removing `inert` on the full marketing page for every toggle; the full-screen panel, modal semantics, and keyboard trap handle navigation isolation.

Visual styling and the ordinary site decorations remain intact. The menu laser sweep remains absent; the standard scroll progress decoration is preserved following the user's request to keep the site's decorative treatment.

Validation: a local proxy stripped all page scripts and blocked JavaScript via CSP. With zero script elements present, English (390px) and Arabic (320px) menus opened/closed, retained the 180ms panel transition, locked background scrolling, and exposed the correct localized control label. Native keyboard activation and navigation were checked too. Hydrated Escape cleanup was separately verified. Production build, TypeScript, scoped lint, and public SEO checks passed during this refinement. No physical-iPhone test or exact device-latency measurement is claimed.

Native disclosure reference: [MDN details element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details).

## Follow-up: touch opening and staggered reveal (2026-09-10)

The user confirmed that closing was now responsive, but opening on both iPhones still paused and then appeared abruptly. A fresh live HTML request confirmed the native disclosure version was deployed. The two-second physical-device delay has not been reproduced locally, so the changes below address observed work in the opening path rather than asserting a proven device root cause.

- A completed single-finger tap now toggles the native disclosure directly on `touchend`, cancelling the compatibility click to avoid a double toggle. Dragged, cancelled, and multi-touch gestures are ignored. Native mouse, keyboard, assistive-technology, and no-JavaScript activation remain available.
- Items use a fresh CSS entry animation on each opening: 340ms movement/fade, with 35ms between rows and no initial delay. The panel fades in over 220ms. Closing uses a 140ms fade without stagger. Reduced-motion preferences remain respected.
- Mobile menu links no longer initiate viewport prefetching when revealed. They retain Next navigation and pending feedback on selection.
- Removed root `:has()` scroll-lock selectors and root overflow changes from toggling. The panel contains its scrolling; gestures outside it are blocked while open. This avoids changing page/viewport geometry as the menu appears.
- Found that `HeroBackground` attached desktop mouse tracking on touch devices. It now requires a fine pointer with hover, preventing Safari's compatibility mouse event from starting the full-hero spotlight during a tap.
- Preserved both decorative drifting orbs, their dimensions, colors, and timing. Their movement now uses CSS transform animations and pauses while covered by the menu, offscreen, or in a background tab, resuming from the paused position. No decorative layer was removed.
- Touch closing no longer programmatically applies keyboard focus; keyboard opening/Escape retain focus placement/restoration.

Validation on the final production build: TypeScript, focused ESLint, production build, public SEO regression checks, and whitespace checks passed. Browser checks covered English at 390px, Arabic at 320px (RTL, no horizontal overflow, localized links and successful demo-page navigation), desktop at 1440px, Escape/focus return, rapid double activation, decoration pause/resume, and native open/close with all scripts blocked. No console errors appeared in the hydrated browser navigation checks.

Additional evidence: Safari in an iPhone 17 Pro / iOS 26.5 simulator was operated through the native UI. A temporary localhost-only timing proxy observed the baseline touch event passing through `mousemove`, then native click/toggle at 53ms after `touchend`. On the final build, toggle occurred at 1ms and the first item animation started at 7ms, with no compatibility mouse/click event and no new resource requests during the sampled opening. These are individual instrumented simulator samples, not INP or physical-phone results. The simulator's animation-frame callbacks remained uneven (roughly 150–200ms apart in the final sample), so they do not establish smooth frame delivery on the user's devices. The temporary proxy and instrumentation are outside the repository and are not deployed.

References: [MDN touch events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events), [Next.js Link prefetch](https://nextjs.org/docs/app/api-reference/components/link#prefetch), [MDN overscroll behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior).


## Follow-up: Anveril menu and phone diagnosis (2026-09-10, local only)

The user confirmed the delayed opening also occurs on the current development
server at `192.168.101.9:3000`; this report cannot be attributed to an old live
build. Desktop success has not established a fix on the physical iPhones.

- Adapted the reference's large divided links, secondary navigation, dotted
  toggle, and expanding top-down ground to Codescope. Arabic words stay joined.
- Replaced the first adaptation's animated full-panel `clip-path` with a separate
  sheet using only a vertical transform, inside static clipping bounds. Text and
  footer use independent transform/opacity transitions. Opening lasts 860ms;
  closing lasts 440ms, with shorter text fades and no entry delays on close.
- Preserved native disclosure activation and the existing completed-touch handler,
  decorations, localized destinations, keyboard focus, and desktop navigation.
- Added opt-in `?menu-debug=1` instrumentation in development only. It shows event
  queue delay, native toggle, sheet transition events, animation-frame callback
  timing, and the reduced-motion setting. No data is stored or transmitted. rAF
  callbacks do not prove when the GPU presented pixels on a physical screen.

One local in-app browser opening recorded 1ms input queue, native toggle at 10ms,
sheet transition start at 25ms, end at 880ms, and a largest rAF interval of 9ms.
These are a single desktop-engine sample, not physical iPhone or INP results.
Physical-phone timing/visual confirmation is still needed.

TypeScript, scoped ESLint, production build, and whitespace checks passed.
Checked Arabic at 320px, keyboard Escape/focus, rapid reversals, short-screen
scrolling and demo navigation, desktop hiding, and absence of the diagnostic
readout in the production build even with the query parameter. No push made.

Physical iPhone feedback for v2, provided by the user: input queue 17ms, native
toggle 10ms, sheet start 39ms, sheet end 1021ms, first rAF 38ms, largest rAF gap
981ms, Reduced Motion off. This places the large gap after activation; it does
not identify a specific blocking function or prove a GPU cause.

The next local revision (diagnostic label v3) preserves the decorative grain as
a pre-rendered 256px WebP tile (~41KB) using the existing fractal-noise parameters,
instead of a full-hero SVG turbulence filter. The reproducible generator is
`scripts/generate-hero-noise.mjs`. Orb transforms retain their compositor hint
and no longer pause on menu toggles; they still pause offscreen/in a background
tab. This avoids changing the large blurred layers during menu activation.
TypeScript and production build passed again. Physical v3 confirmation remains
pending; the rendering changes are hypotheses being tested, not a confirmed fix.

Physical iPhone v3 sample, supplied by the user: queue 21ms, toggle 10ms, sheet
start 35ms, end 862ms, first rAF 34ms, largest rAF gap 359ms, Reduced Motion off.
The gap is smaller in this sample but still substantial. Frame callbacks alone
do not establish whether the compositor animation looked smooth.

Revision v4 also pre-renders the two original blurred circles (650px and 500px,
64px Gaussian falloff, brand teal/purple) with padded transparent bounds. Four
small WebP assets (~7–9KB each; two used per hero) retain both color variants and
the existing CSS motion paths, opacity and timing. No live blur filter remains
on the orb elements. The diagnostics now include the first 15 callback intervals
so a long first frame can be distinguished from sustained low callback cadence.
TypeScript, scoped lint, and the production build passed for this revision.

Physical iPhone v4 sample, supplied by the user: input queue 15ms, native toggle
5ms, sheet start 36ms, end 865ms, first rAF 35ms, largest rAF gap 35ms. The first
15 callback intervals were 35, 11, 3, 15, 16, 17, 17, 16, 17, 17, 17, 16, 17,
17, 16ms; Reduced Motion was off. The user then confirmed: "it feels smooth".
This validates the revised opening on the tested phone, with no long stall in
that sample. It is not a fleet-wide benchmark or a live-site measurement.
The original per-function cause was not profiled; the progressive results
support the changes to decorative rendering as the effective remedy. The final
version remains local and uncommitted/unpushed. The timing overlay is development
only and disappears when `?menu-debug=1` is removed from the URL.

## Follow-up: desktop menu and menu-to-page transition (2026-09-10, local only)

Replaced the public desktop link row with the same dotted menu control used on
phones. The desktop panel follows the Anveril reference's wide composition:
large divided primary links on one side, secondary links and the demo action on
the other. Grid placement mirrors in Arabic; short desktop windows scroll.

Public menu selections now keep the menu interactive with a localized loading
status until the destination content commits. The menu then moves downward while
the incoming page moves down from above, using matching 820ms transform curves.
The moving page is clipped to one viewport for the handoff, and its normal
height/scrolling is restored afterward. The close icon still retracts upward.
The confirmed phone grain/glow optimizations remain unchanged.

Next Link owns navigation, history and network work. Its `onNavigate` callback
starts the enhancement, so modifier clicks/new-tab actions stay native. The
public loading boundary is explicitly identified; a scoped observer waits for
its removal rather than animating a skeleton. Escape, closing during a pending
request, back/forward, same-page links, reduced motion, animation cleanup and
keyboard focus are handled. Internal login keeps normal routing and auth.
Reference: https://anveril.com/
API reference: https://nextjs.org/docs/app/api-reference/components/link#onnavigate

Validation included English desktop at 1440px, Arabic desktop and 320px mobile,
localized public links, unprefixed login, no horizontal overflow, keyboard focus
on the destination, and scroll reset. A temporary read-only proxy delayed route
responses by four seconds: the menu displayed loading feedback, waited through
the loading fallback, and completed the handoff; closing while pending also
worked. The user tested the local phone transition and confirmed: "yes it works
and its amazing". This confirms that tested interaction, not performance on all
devices or the live deployment. No commit or push performed.
Final scoped ESLint, TypeScript, production build, and whitespace checks passed.
Temporary production/proxy test servers were stopped; the existing development
server on port 3000 remains available for review.

## Follow-up: branded menu geometry with neutral color (2026-09-10, local only)

The toggle now uses three recognizable menu bars with squared geometry and
slanted ends inspired by the Codescope wordmark. Two bars rotate into an X;
the middle bar fades away. Per the user's refinement, the icon uses neutral
gray/white rather than brand teal. Fine-pointer hover spreads the bars, extends
the middle bar and brightens the icon; the open X subtly tightens. Press feedback
uses a small scale change. Motion remains transform/opacity based, respects
reduced motion, and retains the native touch activation and 44px hit area.

Checked the open/closed icon, hover transforms/color, Escape, repeated toggles,
and Arabic at 320px without overflow. No commit or push performed.

Tourscope hover refinement: use the existing SVG as a fixed alpha mask and
transition its background color directly from white to brand purple. This
replaces simultaneous brightness/inversion interpolation, which produced a
muted midpoint. Menu arrows now appear on hover or keyboard focus; the current
page alone no longer keeps its arrow visible. Checked Tourscope while active:
white with arrow opacity 0 at rest; purple with arrow opacity 1 on focus, with
no image filter in either state. Native activation and menu/page motion remain
unchanged. Local only.

Desktop menu background handoff: the shorter desktop curtain leaves part of the
document exposed. Preserve the outgoing main/footer viewport in a temporary,
inert, aria-hidden visual copy before routing, conceal destination/loading
content while waiting, then place the incoming page above that surface during
the existing downward handoff. Remove the copy on completion, cancellation,
or menu unmount. The surface is clipped to one viewport and never animated;
mobile and reduced-motion navigation skip it entirely.

Local browser sampling confirmed English and Arabic keep the old heading in
the background across the destination commit, with the incoming page starting
above the viewport as the menu exits. Confirmed cleanup, destination focus,
Escape during navigation, and zero desktop copies at 390px mobile width.
TypeScript, scoped ESLint, production build, and diff whitespace checks passed.
Physical-device smoothness for this desktop-only refinement has not been
measured. No commit or push performed.

Homepage globe follow-up: DOM cloning does not copy canvas pixels, so the
temporary desktop background initially lost the globe. Copy each visible,
non-empty canvas's current bitmap into its counterpart before hiding the live
page. This preserves the rendered globe frame without another animation loop
or image encoding; offscreen and zero-size canvases are skipped. Confirmed in
a local screenshot during Arabic homepage navigation: the globe remains visible
beneath the menu in the waiting state. TypeScript, scoped lint, production build,
and diff checks passed. Still local, with no commit or push.

Globe service coverage refinement: restored the original aircraft fleet,
silhouette, scale and drawing routine exactly from HEAD, at the user's request.
The user selected fine-line icons after rejecting the coverage callout.
Hotel beds and small group outlines now use open, monochrome paths in the
same pale tone as the original planes. Reused Path2D geometry draws with a
narrow dark keyline for separation from land dots; no filled badges or plates.
Hotel positions use a smooth fourth-facing cutoff so at most three glyphs are
visible, fading continuously as the globe rotates. Group outlines follow
selected smooth routes and fade at the horizon and journey endpoints.

The callout and its dedicated CSS have been removed. No service labels appear
beneath the globe. Reviewed English desktop and Arabic 320px appearance, with
legible outlines, no callout remnants and no horizontal overflow.

Group journeys retain smooth cubic paths projected onto the sphere, with
shared tangents through each stop and a small travelling light. Six illustrative
journeys have 65 precomputed points each. Checked finite unit-sphere coordinates
and continuous sampled joins (minimum adjacent tangent alignment 0.9903).
Locations and journeys do not represent live availability or promised routes.

An English/Arabic screen-reader caption describes the illustration; the
existing homepage copy retains the 1.5M+ hotel figure. Mobile frame cap,
reduced-motion handling, offscreen pause and menu canvas-frame preservation
remain in place. Reviewed Arabic desktop and English mobile appearance; no
physical-device frame timings collected. Changes remain local.

Small-icon and logo follow-up: hotel and group glyphs are approximately 12%
smaller, with slightly shorter offsets from their anchors. The public header
logo now brightens its lettering in sequence on fine-pointer hover or keyboard
focus, gently expands the central scope, and reveals fine focus corners. It
uses local SVG fill/transform/opacity transitions, with motion disabled under
reduced-motion preferences. Header dimensions do not change. Verified hover
computed styles and stable bounds, keyboard focus, native menu open/Escape,
and Arabic 320px layout without overflow. Scoped lint, TypeScript and production
build passed. Changes remain local; no commit or push.

Public CTA navigation now shares the menu's 820ms downward handoff. Homepage,
Tourscope, About, Engineering and Pricing page links use a localized `PageLink`:
the current viewport stays visible while Next loads, then moves down while the
destination enters from above. Canvas pixels are preserved, cloned decorations
are paused, and the moving surfaces are clipped to one viewport. The mobile
menu retains its existing lightweight curtain path.

Routing remains with Next Link's `onNavigate`, following the official API:
https://nextjs.org/docs/app/api-reference/components/link#onnavigate
Modified/new-tab clicks, external links and downloads keep native behavior;
hash links, same-path changes and `scroll={false}` skip the handoff. Reduced
motion skips the movement. The temporary surface is inert and hidden from
assistive technology. Cleanup restores scrolling, interactivity and destination
focus; Escape, history navigation, menu opening and a stalled-request timeout
can release the temporary state. Forms and analytics are unchanged.

Verified English homepage-to-Tourscope and pricing-to-demo navigation, selected
package query preservation, Tourscope hash scrolling, desktop menu navigation,
and Arabic demo navigation at 320px. Sampled both animation transforms: they
advanced together across the 676px travel distance at a 740px viewport. No
remaining snapshot, inert main or horizontal overflow after arrival. This is
local browser verification, not physical iPhone performance measurement.

Scoped ESLint, TypeScript and production build passed. Compiled production
homepage and pricing CTA flows completed without new browser errors. Development
pricing reloads showed a hydration warning at the public layout/JSON-LD boundary;
it did not reproduce in the compiled production checks. Existing build warning
about multiple workspace lockfiles remains. Changes are local only.

Navigation loading follow-up: removed the public pending banner, menu loading
message/spinner, and route skeletons. Retained the invisible route-readiness
marker so the existing page/menu stays visible while the destination loads,
then the approved downward transition runs. No form-submission indicators were
changed. Local browser checks observed the old homepage preserved during pending
navigation with no loading text, then verified Tourscope and demo arrival and
cleanup. TypeScript, scoped ESLint, production build and whitespace checks pass.
Local only; nothing committed or pushed.

Login consistency follow-up: replaced the legacy gray/Urbanist editorial view
with an isolated auth shell using Codescope's real wordmark/scope asset, Geist
and IBM Plex Arabic, teal accents, pill actions and light/dark surfaces. Reuses
the existing per-device dashboard theme preference; adds a localized theme
control and website return link. Desktop uses a brand panel; mobile prioritizes
the form. No generated imagery, new dependencies, marketing tracking or auth
endpoint changes. Removed rotating promotional copy and email autofocus.

Updated both credential and OTP styling, responsive six-column code fields,
email error association and reduced-motion step transitions. Existing send,
verify, resend, expiry and dashboard redirect logic remains unchanged. Reviewed
English desktop in both themes and Arabic at 320px in both themes, with no
horizontal overflow, 16px email inputs, theme persistence, native invalid-email
validation and noindex/nofollow retained. No code emails were sent and no live
OTP sign-in was performed. Scoped lint, TypeScript, production build and
whitespace checks pass. Changes remain local, without commit or push.
