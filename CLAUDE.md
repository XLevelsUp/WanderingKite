# CLAUDE.md — Wandering Kite Studio

Codebase knowledge file. Describes what is actually built as of commit `27e5222`.

## Read this first: the checkout is far behind upstream

This working tree is **not** the current state of the product. Two remotes:

- `origin` → `Prahal-Nath-k/WanderingKite` (personal fork) — where `main` and `HEAD` sit
- `upstream` → `XLevelsUp/WanderingKite` (team repo) — where the real work happens

Local `main` (`27e5222`, 2026-02-08) **diverged** from `upstream/main` at `1d8d6f6`.
Upstream is **130 commits ahead**; local carries 1 commit upstream does not
("responsive UI changes"). That is roughly seven months of drift.

`upstream/main` (`5616fec`, 2026-09-08) is a different product: an **npm workspace
monorepo** split into two Next.js apps, backed by Supabase.

```
apps/marketing/   public site + NextAuth (auth.ts, auth.config.ts, middleware.ts)
apps/admin/       staff ERP — lib/access.ts holds the RBAC model
supabase/migrations/
scripts/          incl. seed-equipment.js
docs/             role-based-access-control.md, deployment.md
```

Upstream has, in broad strokes: dual auth (Supabase for staff, NextAuth v5 for clients),
HR/payroll, attendance, a media tracker, equipment deployments, invoicing, a client
portal, booking-conflict resolution, click/session tracking, an admin-authored blog,
audit logging, and a `DEVELOPER` role above `SUPER_ADMIN`. Note there is **no Prisma**
upstream any more — the data model lives in `supabase/migrations/`.

**Everything below this section describes only the local checkout.** Before starting any
feature work, confirm with the user which tree they mean. If the answer is the real
product, fetch `upstream/main` and read `docs/role-based-access-control.md` and
`apps/admin/lib/access.ts` — not this file.

## What this project is (local checkout only)

A **static marketing website** for Wandering Kite Studio, a creative services business in
RS Puram, Coimbatore, Tamil Nadu. Four service verticals: Photography, Equipment Rentals,
Studio Space, Podcast Studio.

**There is no backend.** No database, no API routes, no auth, no server actions, no CMS,
no payment integration, no booking engine. Every route prerenders to static HTML at build
time. All content is hardcoded in TypeScript modules.

The entire conversion funnel is **WhatsApp deep links** (`wa.me/...` with a pre-filled
message). "Booking" means opening WhatsApp — nothing is persisted anywhere.

## Stack

| Concern    | Choice                                          |
|------------|-------------------------------------------------|
| Framework  | Next.js 15 App Router (builds on 15.5.9)        |
| React      | 19                                              |
| Language   | TypeScript 5, `strict: true`, `@/*` → repo root |
| Styling    | Tailwind CSS 3.4 + `app/globals.css` variables  |
| Animation  | Framer Motion 11                                |
| Icons      | lucide-react                                    |
| Font       | Inter via `next/font/google`                    |
| Deploy     | Vercel (assumed; no config committed)           |

## Commands

```bash
npm run dev      # next dev --turbopack
npm run build    # next build  — passes clean, 13 static routes
npm run start
npm run lint     # next lint — NOTE: no ESLint config file is committed
```

No test framework, no CI, no pre-commit hooks.

## Routes (`app/`)

All 13 routes build as `○ (Static)`. Verified via `npm run build`.

| Route          | File                       | Notes                                      |
|----------------|----------------------------|--------------------------------------------|
| `/`            | `app/page.tsx`             | `'use client'` — whole page is client-side |
| `/photography` | `app/photography/page.tsx` | Server component, amber accent             |
| `/rentals`     | `app/rentals/page.tsx`     | Server component, blue accent              |
| `/studio`      | `app/studio/page.tsx`      | Server component, purple accent            |
| `/podcast`     | `app/podcast/page.tsx`     | Server component, green accent             |
| `/privacy`     | `app/privacy/page.tsx`     | 13 sections of legal prose                 |
| `/terms`       | `app/terms/page.tsx`       | 13 sections — rental terms                 |
| `/refunds`     | `app/refunds/page.tsx`     | 10 sections — cancellation/refund policy   |
| `/robots.txt`  | `app/robots.ts`            | Allow-all + sitemap pointer                |
| `/sitemap.xml` | `app/sitemap.ts`           | 8 URLs, hardcoded priorities               |

`app/layout.tsx` is doing a lot: global `metadata` (title/description/18 SEO keywords/
OpenGraph/Twitter/icons), an inline `LocalBusiness` + `ProfessionalService` + `Store`
JSON-LD block (address, geo, opening hours, `hasOfferCatalog` of the 4 services), plus
`<MainNav />` and `<BookingFlyout />` wrapped around `{children}`.

## Component map (`components/`)

**animations/** — reusable motion primitives
- `FadeIn` — `useInView`-gated fade+slide, `direction` and `delay` props, fires once
- `StaggerContainer` — `whileInView` parent that staggers children variants
- `ParallaxHero` — scroll-linked parallax hero. **Currently unused by any page.**

**navigation/** — `MainNav`: fixed, blurred, `h-20`. Links hidden below the `md` breakpoint.

**booking/** — `BookingFlyout`: fixed bottom-right WhatsApp pill, appears after a 2s timer.

**sections/** — page-level blocks
- Homepage-specific, each with its own hardcoded data: `HowItWorks` (3 steps),
  `TechSpecs` (4 gear cards), `FAQ` (6 Q&As), `PortfolioWall` (5 masonry items)
- Prop-driven and reused across service pages: `ProcessTimeline`, `ServiceFAQ`, `Testimonials`

**services/** — `ServiceCard` (homepage grid tile), `EquipmentCard` (rental item + price + CTA)

**shared/** — `TrustSection` (stats/rating/brand badges), `Footer` (4 columns + Instagram CTA)

## Data layer (`lib/`)

- `whatsapp.ts` — `generateWhatsAppLink(service?, customMessage?)`. Single
  `WHATSAPP_NUMBER = '917010092090'` constant plus per-service default messages.
  **This is the intended single source of truth for the contact number.**
- `equipment-data.ts` — `Equipment` interface + `equipmentCatalog` (10 items: 3 cameras,
  3 lenses, 2 lighting, 2 audio) with daily/weekly INR rates and spec bullets. Helpers:
  `getEquipmentByCategory`, `getEquipmentById`.
- `service-page-data.ts` — testimonials / process steps / FAQs for rentals, studio and
  podcast. Photography's equivalents are inlined in its own page file, not here.

## Conventions to follow

**Accent colour system.** Each vertical owns a colour: photography=amber, rentals=blue,
studio=purple, podcast=green. Shared components take an `accentColor` prop typed
`'amber' | 'blue' | 'purple' | 'green'` and look it up in a static class map. Always extend
the map — never build class names by string interpolation (see Known issues #6).

**Client boundaries.** Keep pages as server components so they can `export const metadata`.
Push `'use client'` down into the animation and interactive components. `app/page.tsx`
breaks this rule and is fully client-side.

**CTAs.** Route every WhatsApp link through `generateWhatsAppLink()`. Several files
currently hardcode `wa.me/...` instead — that is the bug, not the pattern.

**Styling.** Tailwind utilities inline. Dark palette only (`bg-zinc-950` / `text-white` set
on `<body>`); there is no light mode and no theme toggle. Service pages open with `pt-20`
to clear the fixed nav.

**Formatting is inconsistent across the repo** — `app/page.tsx` uses 2-space indent and
single-quoted JSX attributes; most other files use 4-space and double quotes. Match the
file you are editing.

## Known issues (verified, not speculative)

Ordered roughly by business impact.

1. **Wrong phone number in hardcoded links.** `lib/whatsapp.ts` uses `917010092090`, but
   `components/sections/FAQ.tsx:83`, `components/sections/ServiceFAQ.tsx:69`,
   `app/terms/page.tsx:226` and `app/refunds/page.tsx:259` hardcode `wa.me/919876543210`.
   `tel:+919876543210` also appears in `components/shared/Footer.tsx:138`,
   `app/privacy/page.tsx:169` and `app/refunds/page.tsx:261` while the visible link text
   reads "+91 70100 92090". These links send leads to the wrong number.
2. **Legal pages say Bangalore.** `/privacy`, `/terms`, `/refunds` and
   `lib/service-page-data.ts:64` all reference "123 Creative Hub, MG Road, Bangalore,
   Karnataka 560001" — including the governing-law and jurisdiction clause — while the rest
   of the site and the JSON-LD say RS Puram, Coimbatore.
3. **No `public/` directory.** `/og-image.jpg`, `/icon.svg`, `/favicon.ico`,
   `/apple-icon.png` and the per-page `/og-*.jpg` files referenced in metadata all 404.
   `lib/equipment-data.ts` also points at `/equipment/*.jpg` files that do not exist.
4. **`metadataBase` is unset.** The build warns about this; OG and Twitter image URLs
   resolve against `http://localhost:3000`, so social previews break in production.
5. **Placeholder phone in JSON-LD.** `app/layout.tsx` ships `"telephone": "+91-XXXXXXXXXX"`
   to search engines.
6. **Dynamic Tailwind class never compiles.** `components/sections/Testimonials.tsx:49`
   builds a `fill-<colour>-500` class by interpolation. Tailwind scans source statically and
   there is no safelist, so star ratings never render filled.
7. **Broken Tailwind theme colours.** `tailwind.config.ts` maps `background`/`foreground` to
   `var(--background)` / `var(--foreground)`, which `app/globals.css` never defines (it
   defines `--bg-primary`, `--text-primary`, and friends). `bg-background` resolves to nothing.
8. **Duplicate floating CTA.** `BookingFlyout` renders in `app/layout.tsx:160` *and* again in
   each of the four service pages — two stacked buttons on those routes.
9. **No mobile navigation.** `MainNav` hides its links with `hidden md:flex` and there is no
   hamburger or drawer. On phones only the logo and the Contact button are reachable.
10. **Opening hours contradict themselves.** `Footer` hardcodes "Open Now (9 AM - 9 PM)" with
    a live-looking pulsing dot; the JSON-LD says Mon–Fri 09:00–18:00, Sat 10:00–17:00.
11. **Unverified social proof.** `TrustSection` ("100+ Clients", "500+ Projects",
    "4.9 Google Reviews"), the Footer's "Trusted by 500+ creative professionals", and every
    testimonial across the site are placeholder content on a live commercial page.
12. **Dead code.** `ParallaxHero` is unused; `staggerItemVariants` (exported from
    `StaggerContainer`) is unused; `PortfolioWall` is imported at `app/page.tsx:8` but its
    render is commented out at line 135.
13. **`EquipmentCard` ignores its `image` prop** and always renders a placeholder camera icon.
14. **No ESLint config committed**, so `npm run lint` has nothing to run against.
15. **README is partly stale** — it documents a `public/` directory and a metadata export on
    `app/page.tsx` that do not exist, and omits the legal pages, `sitemap.ts` / `robots.ts`,
    and the whole `components/sections/` directory.

## Fixing the number and address problems

Both are content-duplication bugs. The durable fix is a single `lib/site-config.ts` holding
phone, WhatsApp number, email, postal address and opening hours, which `lib/whatsapp.ts`,
`Footer`, the JSON-LD in `layout.tsx` and the three legal pages all read from — rather than
patching seven files and waiting for them to drift apart again.
