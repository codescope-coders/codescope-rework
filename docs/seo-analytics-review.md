# Public SEO and analytics review

Reviewed locally and against the public site on 9 September 2026. Changes are in the workspace; this work did not deploy them or change Google accounts/DNS.

## Evidence and boundaries

- **Source audit:** public Arabic and English previously shared cookie-selected URLs (`localePrefix: never`). Some localized metadata existed, including the Tourscope title; it has been retained where appropriate. There was no canonical/hreflang map, sitemap, robots handler, JSON-LD, GA4 tag, conversion tracking or consent interface in the public source. No relevant GA4/GSC environment configuration was present locally. Existing Turnstile, SendGrid and form endpoints were reused.
- **Live HTTP audit:** `/ar` and `/ar/tourscope` returned 307 redirects to the bare English URLs. `/robots.txt` and `/sitemap.xml` returned homepage HTML with status 200. `www.codescope.dev/tourscope` returned 200, duplicating the apex host. Homepage and Tourscope HTML had no canonical/hreflang or Google verification meta tag. A live browser visit found no Google analytics/tag requests during the observed visit; this is not proof about every possible consent state or external deployment configuration.
- **Live DNS:** a `google-site-verification` TXT record already exists at `codescope.dev`. It was not changed. This suggests an existing ownership setup; it does not establish which Google account owns a property, whether verification is current, or whether reports contain data.
- **Search data:** no authenticated Search Console or GA4 reports were available. No traffic, keyword volumes, rankings, conversion rates or indexing improvements are claimed. Content priorities below are inferred from existing product content, not validated search demand.
- **Local data limitation:** the jobs database/API is unavailable locally. Missing-data and error behavior were checked; real active-role rendering and sitemap expansion need a reachable production database. No database records, real submissions or emails were created by testing.

## Implemented

### Language URLs and discovery

English remains `/`, `/tourscope`, `/pricing`, `/services`, `/about`, `/contact`, `/get-started`, `/jobs` and `/jobs/{id}`. Arabic is `/ar` and `/ar/...`. The public language depends on the URL, not the locale cookie or Accept-Language. Redundant `/en/...` paths redirect permanently to the English canonical while preserving the query string. Public `www.codescope.dev` pages redirect permanently to the apex; combined www + /en requests normalize in one hop.

The language switcher navigates to localized URLs and retains query/hash and scroll position. Public navigation and job links retain the current language. The dashboard/login have a separate `never` routing configuration, preserving their bare URLs and cookie-based language. Authentication branches and permission checks were not rewritten.

`lib/site-urls.ts` owns the canonical origin and URL mapping. Every indexable public page has one self-canonical and reciprocal `en`, `ar`, `x-default` alternates. Query variants canonicalize to the clean page. `/sitemap.xml` contains the 16 static language URLs plus available public jobs when the database responds. It omits closed/missing jobs, internal routes and query variants. Static pages have no fabricated modification dates; job dates come from the database. The sitemap revalidates hourly, so role changes/database recovery can take up to the next successful revalidation to appear.

`/robots.txt` allows public crawling and excludes dashboard/API routes. Login is crawlable with `noindex, nofollow` so crawlers can read its indexing rule. Dashboard layouts have the same indexing rule; API responses receive `X-Robots-Tag`. Invalid locale-like filenames now return 404 instead of rendering a homepage. Robots rules are not an authentication mechanism.

### Metadata, content and structured data

`lib/site-meta.ts` contains unique, concise English and Arabic titles/descriptions. Both existing Tourscope titles are unchanged. Every public page has complete Open Graph and Twitter metadata with its own title, description and canonical URL. The existing 1742×903 product composite is used as sharing imagery; the short footer wordmark was unsuitable for a social card. No generated imagery or invented customer claims were added.

JSON-LD includes CodeScope Organization, localized BreadcrumbList and Tourscope SoftwareApplication. It uses the site's name, public email, existing logo/screenshot, software category and supported booking functionality. No ratings, reviews, prices, customer results or unverified legal address were added. Software schema describes the entity; without review/rating/offer information it should not be presented as eligible for Google's software rich result. No JobPosting rich-result markup was invented from incomplete role data.

Job metadata uses the actual position/location when available. Public role content is server-rendered through initial query data, and all loaded role links are discoverable in initial HTML. A separate small, time-bounded read pool selects only public job columns, never applicants. Closed/unavailable role pages are noindex, confirmed missing IDs return 404, and a database outage produces a safe localized metadata fallback instead of breaking the whole page. Operator-authored role text keeps its original language with automatic text direction; the site does not fabricate translations of it.

A contextual Tourscope-to-pricing link makes packages and setup costs discoverable at the end of the product tour. Existing detailed pricing FAQs remain server-rendered. The compact purple mobile hero, early booking preview, primary demo action, mobile pills and smooth section scrolling were preserved.

### Mobile performance

Only client-used translations cross the public hydration boundary. Dashboard/auth providers still receive their complete catalogue. The existing Arabic fonts were converted to WOFF2; their glyph order and horizontal metrics were checked against the originals. The four files total 930,780 bytes as TTF versus 289,148 bytes as WOFF2. Originals remain available; the WOFF2 files are about 69% smaller on disk. The mobile scroll-reveal dim color was raised for readable contrast; desktop reveal styling remains unchanged.

The next performance priority is the Tourscope page's substantial initial HTML and interactive preview bundle. Split/defer below-the-fold interactive demonstrations while retaining their useful text and links in server HTML. Do not hide the hero behind hydration or restore heavy mobile scroll animation. Use field Core Web Vitals when available to confirm priorities; Lighthouse TBT is not a field INP measurement.

### Analytics prepared, disabled by default

No new GA property or measurement ID was invented or connected. No GTM container was added. The marketing layout enables the integration only when both `GA4_ENABLED=true` and a valid `GA4_MEASUREMENT_ID` are supplied at runtime. Without them there is no tag request or consent banner.

When enabled, the English/Arabic opt-in controls give accept and reject equal prominence and provide persistent Privacy settings. No Google tag is loaded before opt-in. Consent is stored for 180 days in localStorage; withdrawal disables the tag, clears its first-party cookies and reloads to remove its listeners. Advertising consent, Google signals and ad personalization remain disabled. This implements basic consent gating; the business must approve its consent/privacy policy before enabling it.

Events:

| Event | Trigger | Non-personal parameters | Key event? |
| --- | --- | --- | --- |
| `page_view` | Initial public visit or a different public route, after consent | Clean canonical URL, fixed page title, language, sanitized referrer | No |
| `demo_cta_click` | An ordinary click on an internal link to `/get-started` | Destination route and public page context | No |
| `generate_lead` | Confirmed contact API `{ok:true}` or demo API **201** + `{ok:true}` | `lead_type=contact` or `demo_request`, public page context | Mark only after live validation |

No form contents, names, agency names, email addresses, phone numbers, request records, amounts or submission tokens enter analytics. URL query strings and fragments are removed; external referrers are reduced to their origin. Consequently UTM campaign parameters are intentionally not collected by this implementation. There is no user-ID or user-provided-data setup.

A synchronous submission lock prevents same-tick double submits; a local random token deduplicates success events and is never sent to Google. Failure responses, HTTP-200 bodies with `ok:false`, and the package form's honeypot 200 response do not generate leads. Consent granted after a submission does not replay that submission. Deduplication concerns event emission in the current form instance; it is not backend idempotency across separate visits or a CRM unique-lead count.

The integration is absent on dashboard/login. Public tracking is disabled when leaving marketing routes, and event functions also check a public-route allowlist. **Before enabling it, disable GA4 Enhanced measurement for this stream** to prevent automatic history/form/outbound events from duplicating manual events or capturing unsanitized values. Do not install a second GA/GTM snippet in a host, CMS or proxy. Real receipt at Google remains unverified until account configuration and browser validation.

## Deployment configuration

These are **runtime server environment values**, passed to public client code only as needed. Unlike the existing Turnstile public key, they do not need Docker build arguments. The production compose file now forwards them. Put real values in the production host's environment/.env next to that compose file, or the actual hosting provider's production environment settings, then recreate/restart the app using the normal release workflow.

```dotenv
GA4_ENABLED=false
GA4_MEASUREMENT_ID=
GA4_DEBUG_MODE=false
GOOGLE_SITE_VERIFICATION=
```

- Set `GA4_MEASUREMENT_ID` to the selected web stream's real `G-...` ID, then enable only after the consent/privacy and stream settings checks.
- Keep debug off in normal production. Use Tag Assistant for your device; `GA4_DEBUG_MODE=true` is an optional temporary test-environment setting and omits the debug parameter again when false.
- `GOOGLE_SITE_VERIFICATION` is optional for a URL-prefix property: enter only Google's meta tag `content` token, not the entire tag. It is unnecessary for an already verified Domain property. Keep the existing DNS TXT record.
- Keep analytics disabled on previews/local development. No secrets need to be pasted into chat.

## Validation

Run `npx tsc --noEmit`, `npm run build`, and `BASE_URL=http://localhost:3000 node scripts/check-public-seo.mjs` (prefer a local production server for release checks). The HTTP checker also works against production after deployment. It checks multilingual HTML metadata, canonical/hreflang, unique titles, schema presence, sitemap entries, indexing rules and permanent normalization redirects without submitting forms.

Additional local browser tests used Chromium and WebKit at 320/375/1440 pixels. Google transport and both form APIs were intercepted for analytics tests using an explicitly local fixture identifier. This validates logic/queued events without sending real analytics, writing leads or delivering email. The initial and final mobile render results and Lighthouse reports are in `/tmp/codescope-seo/` on this machine; they are local lab artifacts, not Search Console or GA reports.

### Results recorded

- TypeScript and production build pass. Scoped public-site/SEO lint has zero errors and three existing unused-import warnings in ProductSlices. Full-project lint still has 24 errors and 41 warnings in existing dashboard/API/shared code; it is not reported as passing.
- Production browser checks passed for all 16 static localized pages: rendered titles/descriptions, canonical/hreflang, OG/Twitter, schema, internal links and the opposite locale cookie. English-prefix redirects, login language/noindex, unauthenticated dashboard redirects, invalid/missing paths, missing-job fallback, XML sitemap and plain-text robots were checked. Invalid session cookies still redirect to login and are cleared. Valid authenticated dashboard workflows were not exercised.
- Optional Google verification meta configuration was checked with a local fixture: present on public pages, absent on login. The fixture is not a real connected property.
- Chromium and WebKit passed at 320, 375 and 1440 pixels in both languages (12 Tourscope renders). Mobile demo-button bottoms were 344–348px in English and 291–294px in Arabic. No horizontal overflow. Hotel-tab clicks produced multiple smooth-scroll frames, and language changes retained the deep-section position.
- Both forms passed mocked failure, false-success, successful-submit and same-tick double-submit cases in English and Arabic. Confirmed submissions emitted one event each; CTA navigation emitted only a click. Persisted rejection, withdrawal and exclusion of login activity passed. No PII was found in the queued event parameters.
- Local production HTML before/after message trimming: home 227,335 → 182,192 bytes; contact 120,412 → 74,743; Tourscope English 609,317 → 565,283; Arabic 656,324 → 594,550. These are uncompressed responses from this implementation session, not live network or field data.
- Local Lighthouse 13.4.1, default mobile simulation, cold navigation: Tourscope English **75 performance, 100 accessibility, LCP 5.1s, TBT 20ms, CLS 0**; Arabic **71 performance, 100 accessibility, LCP 5.7s, TBT 10ms, CLS 0.004**. The earlier English run in this SEO session was 72 performance / LCP 5.5s before font compression; single runs are noisy and not a controlled traffic experiment. LCP remains above the desired 2.5s threshold. No field INP, real-user Core Web Vitals or live SEO improvement is claimed.

## Content priorities requiring business input

1. **A buying guide on Tourscope:** clarify what “white-label” includes (brand/domain, storefront, agency dashboard, mobile apps by package) and what the agency must provide. Existing product and pricing content supports the topics. Supply the definitive launch checklist, training scope, supplier-contract requirements and actual launch-time range before publication.
2. **A Charter vs Standard vs Advanced decision guide:** reuse `data/pricing.ts` and the current FAQs. Validate prices, billing terms, included integrations and support boundaries. Use concrete agency situations without asserting demand or inventing savings.
3. **A product walkthrough:** show flight booking → confirmation → payment/reconciliation, and a separate hotel or charter workflow. Use existing UI or approved captures with demonstration data. Supply a current Arabic capture; use a close crop of the actual workflow instead of shrinking a complete dashboard into an unreadable phone image. Clearly distinguish sample booking data from customer proof.
4. **A documented customer case study:** choose an existing customer only with approval to name/use their logo. Supply the original workflow, what was implemented, dates, measured before/after figures with definitions, and an approved quote. If metrics or permission are missing, publish a product walkthrough instead. No customer story or outreach was created.
5. **Confirm current claims:** team size, supplier/integration counts, live tenant/app counts, support/24-hour response promises, security/data-access statements, cancellation/refund/data-retention policies and whether integrations are contracted/direct or intermediary. These are existing site statements, not facts independently proven by this audit.

Suggested copy direction: keep the new short mobile hero. On the request page, a more specific heading such as “See Tourscope with your agency’s workflow” / “شاهد كيف يعمل تورسكوب لوكالتك” can set expectations once the demo process is confirmed. Replace repeated generic “all-in-one” explanations with concrete booking tasks and package boundaries. Product screenshots should explain one task per image, with a short caption and readable Arabic text.

## Reports needed to replace provisional recommendations

- **Search Console:** access to the existing `codescope.dev` Domain property (read access for analysis; verified owner for verification/linking). Or export Search results for the last 16 months and a last-90-days comparison: Queries, Pages, Countries, Devices, Search appearance, plus clicks/impressions/CTR/position; Page indexing reasons and affected URL samples; Sitemaps status; URL Inspection examples for `/tourscope` and `/ar/tourscope`; mobile Core Web Vitals.
- **GA4:** Viewer access to the correct property, or aggregate exports for the last 90 days: Landing page × session source/medium × device; sessions/engaged sessions; event and key-event counts; `generate_lead` split by `lead_type`; and a path/funnel from product/pricing pages through demo clicks to successful enquiries. Register an event-scoped `lead_type` custom dimension if it is needed in standard reports/explorations. Exclude internal staff and test traffic according to the property’s actual filter setup.
- Google query reports cannot be treated as a person-level path to a specific contact form submission. Do not export form/CRM personal data for this analysis. Grant access through Google account controls or supply aggregate reports; never share passwords, private keys or session cookies.

## Official implementation references

- [next-intl routing configuration](https://next-intl.dev/docs/routing/configuration) and [middleware](https://next-intl.dev/docs/routing/middleware): public `as-needed` routes, explicit URL-based detection and independent internal routing.
- [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions): distinct language URLs, self and reciprocal alternate references.
- [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) and [sitemap convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap): rendered metadata and XML sitemap generation.
- [Google SoftwareApplication guidance](https://developers.google.com/search/docs/appearance/structured-data/software-app) and [breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb): truthful entity markup and rich-result limitations.
- [Consent mode](https://developers.google.com/tag-platform/security/guides/consent), [recommended events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead), [Enhanced measurement](https://support.google.com/analytics/answer/9216061): consent gating and manual lead/page events.
- [Create/select a GA4 property and web stream](https://support.google.com/analytics/answer/9304153), [find the measurement ID](https://support.google.com/analytics/answer/9539598), [DebugView](https://support.google.com/analytics/answer/7201382), [mark key events](https://support.google.com/analytics/answer/13128484).
- [Verify Search Console ownership](https://support.google.com/webmasters/answer/9008080), [submit/check sitemaps](https://support.google.com/webmasters/answer/7451001), [URL Inspection](https://support.google.com/webmasters/answer/9012289), [link Search Console with GA4](https://support.google.com/analytics/answer/10737381).
