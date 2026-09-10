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
