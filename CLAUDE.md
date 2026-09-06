# CLAUDE.md

Guidance for working in this repo. Read this before making changes.

## What this project is

One Next.js app hosting **two distinct products** that share tooling but must not
leak into each other:

1. **Public marketing site** — the Codescope agency site + careers/jobs +
   Tourscope pages. Route groups `(client)`, `(admin)/careers`. Public theming.
2. **Internal ops dashboard** — "Codescope Follow-up" (كودسكوب متابعة): an
   Arabic-first RTL back-office for sales pipeline, project delivery, servers,
   employee reports, leaves, full finance (ledger / spend requests / payroll /
   subscriptions / invoices / archive), partners & profit distribution, users,
   and settings/branding. Route group `(dashboard)`, gated by email-OTP login +
   role-based permissions.

When you touch shared files (globals.css, schema, i18n), **keep the two products
isolated** — never restyle or re-token the public site while working on the
dashboard, and vice-versa.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Drizzle ORM (node-postgres
`Pool`) · TanStack Query 5 · axios · next-intl (en/ar, `localePrefix:
"as-needed"`) · Tailwind v4 (`@tailwindcss/postcss`) · `motion` (v12, import from
`motion/react`) · radix-ui · zustand · sonner · jose (JWT) · bcryptjs.

## Commands

```bash
npm run dev            # dev server
npm run build          # production build — MUST stay green after changes
npm run lint           # eslint
npm run db:generate    # drizzle-kit: generate a migration from schema.ts
npm run db:migrate     # apply migrations
npm run db:push        # push schema straight to DB (dev)
npm run db:studio      # drizzle studio
npm run db:seed        # tsx lib/db/seed.ts (seeds the ADMIN account)
```

Verify with `npx tsc --noEmit` and `npm run build` before declaring done.

## Dashboard architecture

### Layers (the module template — clone this for any new dashboard feature)

Every dashboard feature is the same 4-layer stack. Mirror an existing module
(e.g. `pipeline`, `payroll`) exactly rather than inventing a new shape.

1. **`services/<x>.ts`** — DTO types + CRUD functions that talk to Drizzle and
   return a `NextResponse`. Convention: reads return `{ message, payload }`,
   writes return `{ message, success }`.
   - Drizzle timestamp columns are `Date`, not `string`. When a DTO types them as
     `string`, cast the query result: `return ... as unknown as XDto[]`. This is
     the established pattern (see `services/jobs.ts`); do not "fix" it per-field.
   - Guard every mutating/scoped function with `requirePermission(request, CODE)`
     from `lib/rbac/guard.ts`.
2. **`app/api/<x>/route.ts`** (+ `[id]/route.ts`) — thin route handlers that call
   the service. **Use `PUT`, not `PATCH`.** In `[id]` handlers, `params` is a
   **Promise**: `const { id } = await params`.
3. **`hooks/use<X>.ts`** — react-query wrappers over `lib/apiClient.ts`
   (`ApiClient`). Mutations take `{ id, data }` or `id`; on success invalidate the
   feature's query key. Success callbacks are passed in by the view (for `toast`).
4. **View / page / modal / dict** under
   `app/[locale]/(dashboard)/dashboard/<x>/`.

### Shell & navigation

- `components/dashboard/dashboard-shell.tsx` wraps every dashboard page.
- Sidebar: `components/dashboard/sidebar/` (rail + accordion items, collapsed
  flyouts, RTL-aware). Nav is data-driven from
  `components/dashboard/nav-config.ts` and pruned per-user by
  `filterSidebarConfig(NAV_GROUPS, can)`.
- Header (GlobalBar): `components/dashboard/topbar.tsx` + `header/`
  (`header-menu.tsx` dropdown primitive, `breadcrumb.tsx`) + `notification-bell`.
- Brand: `components/dashboard/brand-mark.tsx` shows a tenant's uploaded logo;
  when none is set the sidebar renders the real Codescope wordmark
  (`assets/logo/header-logo.tsx`, theme-adaptive via `currentColor`).
- Stores: `stores/sidebar.ts`, `stores/dashboardTheme.ts`,
  `stores/commandPalette.ts` (zustand).

### Shared UI kit — `components/dashboard/ui/`

`Button`, `Card`, `StatCard`, `StatusBadge`, `EmptyState`, `PageHeader`,
`Spinner`, `Field`/`Input`/`Textarea`/`NativeSelect`, `Modal`, `TableWrap`/
`Table`/`Th`/`Td`, `SubTabs` — exported from `ui/index.ts`.

**Keep these component APIs stable.** ~20 modules consume them; restyle by
changing internals, never by changing props/exports.

## RBAC — `lib/rbac/`

- `permissions.ts`: `PERMISSIONS` token catalog, `ROLE_PERMISSIONS` map, the 6
  roles (`ADMIN`, `ACCOUNTANT`, `EMPLOYEE`, `DEVELOPER`, `DESIGNER`, `SYSADMIN`),
  `resolvePermissions(role, overrides)`, `makeCan`, sidebar filtering.
- `guard.ts`: `requireAuth` / `requirePermission(request, code)` for API routes;
  `AuthClaims { id, email, name, role }`.
- `use-permissions.ts`: client `useCan()` predicate.
- The **same** permission map drives both API guards and client nav gating, so
  "what a user can do" and "what a user can see" never drift.
- Own-vs-all scoping: `VIEW_X` = the caller's own rows, `VIEW_X_ALL` = everyone's.
- **Separation of duties is intentional.** `MANAGE_PAYROLL` (build sheets) is
  separate from `APPROVE_PAYROLL` (approve them, ADMIN-only). Likewise spend
  requests: `CREATE_SPEND_REQUEST` vs `APPROVE_SPEND_REQUESTS`.

## i18n

Two complementary mechanisms — pick per string:

- **Shell / cross-module strings** → global next-intl `dash` namespace in
  `i18n/locales/{en,ar}.json` (nav labels, common actions). Read with
  `useTranslations("dash")`; components use a `t.has(key) ? t(key) : fallback`
  helper so a missing key never throws.
- **Module-local strings** → a co-located `x.i18n.ts` dict (`{ en: {...}, ar:
  {...} }`) read via `useDict(xDict)`. This avoids constant merge contention on
  the big JSON files. Enum/role labels live centrally in
  `lib/dashboard/labels.ts` (`useLabels()`).
- Formatting helpers (money, dates, Arabic digits) → `lib/dashboard/format.ts`.
  Enum arrays + tone maps → `lib/dashboard/constants.ts`.
- Everything must work in both **LTR (en)** and **RTL (ar)**. Use logical
  properties (`ps-`/`pe-`, `start`/`end`, `-scale-x-100`/`rtl:` for
  directional icons).

## Theme & design system

- Ported from `whitelabel-console` (Geist-style). Raw `--theme-*` tokens are
  mapped to `--color-*` via `@theme inline` in `app/[locale]/globals.css`,
  repainted to **Codescope teal** (light `#08baa8`, dark `#1fd9c4`).
- Light/dark is switched by a **`[data-theme="light|dark"]` attribute** on the
  dashboard shell — **NOT** a `.dark` class. Therefore **never use `dark:`
  utilities in dashboard components**; the tokens already invert.
- Shared shadcn vars (`--primary`, `--card`, …) are re-pointed to `--theme-*`
  **only inside `[data-theme]`**, so the public marketing site is untouched.
- The dashboard design system CSS is **purely additive** at the tail of
  `globals.css`. Interactive controls (`button`, `[role="button"]`, `a`,
  `.cursor-pointer`) are `user-select: none` inside `[data-theme]` so a click on
  a re-rendering list never drags a text selection across the page.

## Auth

Email-OTP login (SendGrid via `lib/email.ts`, `services/otp.ts`, `app/api/auth/
otp/{send,verify}`). JWT via `jose` (`lib/jwt.ts`); claims carry `{ id, email,
name, role }`. `middleware.ts` handles locale + dashboard auth. Seed admin:
`amirtouma1998@gmail.com`.

## CAPTCHA on the public forms

Cloudflare Turnstile guards the two unauthenticated write surfaces —
`/api/contact` and `/api/package-requests`. Widget:
`components/site/TurnstileWidget.tsx` (managed mode, explicit render, dark
theme, `ar-eg` on the Arabic locale). Verification: `lib/turnstile.ts`, called
at the TOP of both routes, before any insert or mail.

Two env vars, and it is enforced only when **both** are set:

| var | where it is set | why |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **image build ARG** (Dockerfile → CI) | Next inlines `NEXT_PUBLIC_*` into the browser bundle at build time. Setting it only at runtime does nothing — measured: the client chunk falls back to a `process` polyfill with an empty `env`. |
| `TURNSTILE_SECRET_KEY` | runtime (`docker-compose.prod.yml`) | server-only, rotatable without a rebuild |

Get both from the Cloudflare dashboard → Turnstile → Add site (hostnames
`codescope.dev` and `www.codescope.dev`).

With either missing the widget does not render, no token is sent, the routes
skip verification, and one `[turnstile] verification DISABLED: …` line names
which half is absent. That is deliberate: the two values travel by different
routes (bundle vs container env), so a half-configured deploy has to degrade to
the pre-Turnstile behaviour rather than demand a token from a page that has no
widget. The honeypot on `/get-started` is unaffected and still runs first.

⚠️ **Do not add the site key to `docker-compose.prod.yml`.** It is the one
combination that breaks the forms — see the comment there.

`verifyTurnstile` FAILS OPEN when Cloudflare's siteverify is unreachable or
slower than 5s (loud warn). A Cloudflare outage should cost spam, never the
site's only lead path. A token Cloudflare actively *rejects* is still refused,
as a 400 `captcha_failed`, which the forms render as `common.captchaError` and
recover from by resetting the widget.

## Business automations (replicated from the original spec — keep intact)

- Pipeline lead → `SIGNED` creates a `PENDING_ACTIVATION` subscription.
- Project `systemName` ↔ subscription sync.
- Spend-request **approve** → posts an `EXPENSE` ledger entry (+ payroll
  `lastPaid` when it's a salary).
- Payroll sheet **approve** → posts one ledger entry per employee.
- Distribution → posts one `EXPENSE` ledger entry per partner (category
  "توزيع أرباح").
- Invoice status is computed from `total` vs `paid`.

## Gotchas checklist

- [ ] `params` is a Promise in `[id]` route handlers — `await` it.
- [ ] `PUT`, not `PATCH`.
- [ ] Cast Drizzle rows with `as unknown as XDto[]` when the DTO uses `string`
      dates.
- [ ] No `dark:` utilities in dashboard code — use the `[data-theme]` tokens.
- [ ] Don't change UI-kit or nav-config public APIs; restyle internals only.
- [ ] Every new API route: guard with `requirePermission`, and gate its nav item
      in `nav-config.ts` with the matching permission.
- [ ] Keep the public marketing site + its tokens untouched when doing dashboard
      work.
