# Deployment

WanderingKite is split into two independent Next.js apps in one repo, using plain npm workspaces (no Turborepo/Nx, no shared package — see the note on duplication below).

| App | Path | Domain | Audience |
|---|---|---|---|
| Marketing | `apps/marketing` | `wanderingkite.in` (+ `www`) | Public — homepage, service pages, blog, and the customer portal (`/client/*`) |
| Admin | `apps/admin` | `admin.wanderingkite.in` | Internal — staff ERP, HR/payroll. Never indexed, can be locked down later (VPN/IP allowlist) without touching marketing. |

Both apps read/write the **same Supabase project** — there is no per-app database, only per-app credentials/scope.

## Why two deployments, not one

Splitting lets admin be redeployed, scaled, and (later) access-restricted independently of the public site, and keeps a broken admin build from ever taking down `wanderingkite.in`. The customer portal (`/client/*`) lives inside `apps/marketing`, not admin — customers are public users, and admin's whole reason for existing on its own subdomain is to stay 100% staff-only and lockable.

## Local development

```bash
npm install              # installs both workspaces from the root
npm run dev:marketing    # http://localhost:3000
npm run dev:admin        # http://localhost:3001
```

Both can run at once — admin's `dev`/`start` scripts are pinned to port 3001 so there's no collision.

## Env vars — `apps/marketing`

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key — used for all normal reads and for the browser client |
| `SUPABASE_SERVICE_ROLE_KEY` | **Bypasses RLS.** Used only inside `app/api/client/*` route handlers for customer signup/login. Do not import `lib/supabase/admin.ts` anywhere else in this app — see [Duplicated files](#duplicated-files-and-the-manual-sync-cost) below. |
| `NEXTAUTH_SECRET` | Signs the customer-portal session cookie (NextAuth). **Must be set to a real generated value** (`openssl rand -base64 32`) — the code no longer has a hardcoded fallback; a missing value should fail startup rather than silently default. |
| `NEXT_PUBLIC_ADMIN_URL` | Base URL of the deployed admin app (e.g. `https://admin.wanderingkite.in`). Marketing's middleware redirects a staff member who is logged into Supabase but lands on `/client/*` to `${NEXT_PUBLIC_ADMIN_URL}/dashboard`. Falls back to a relative `/dashboard` (which 404s in this app) until this is set — **set this before going live**. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity (photography vertical) |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID_STUDIO` | Microsoft Clarity (studiospace vertical) |
| `NEXT_PUBLIC_PINTEREST_VERIFICATION_ID` | Pinterest site verification |
| `INSTAGRAM_ACCESS_TOKEN_WANDERINGKITE`, `INSTAGRAM_APP_NAME_WANDERINGKITE`, `INSTAGRAM_APP_ID_WANDERINGKITE`, `INSTAGRAM_APP_SECRET_WANDERINGKITE` | Instagram feed — main account |
| `INSTAGRAM_ACCESS_TOKEN_STUDIO`, `INSTAGRAM_APP_NAME_STUDIO`, `INSTAGRAM_APP_ID_STUDIO`, `INSTAGRAM_APP_SECRET_STUDIO` | Instagram feed — studiospace account |

## Env vars — `apps/admin`

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Same Supabase project as marketing |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Used extensively — staff CRUD across clients, employees, invoices, equipment, etc. This is expected and lower-risk here than in marketing, since this app is never public. |
| `NEXT_PUBLIC_MARKETING_URL` | Base URL of the deployed marketing app (e.g. `https://wanderingkite.in`). Used by admin's "view live post" links (blog CMS) to build absolute URLs, since the public blog no longer lives in this app. |

## Hosting

Two separate hosting projects/deployments are required (e.g. two Vercel projects pointed at the same repo, each with **Root Directory** set to `apps/marketing` or `apps/admin` respectively). This is a manual step outside the codebase:

1. Create two projects in your hosting provider, both from this repo, on this branch (or `main` once merged).
2. Set each project's root directory to its app folder.
3. Set each project's env vars per the tables above.
4. Point `wanderingkite.in` (+ `www`) at the marketing project, and `admin.wanderingkite.in` at the admin project. DNS/domain configuration (A/CNAME records, subdomain setup) is a manual step in your DNS provider and hosting dashboard — not part of this repo.
5. Once both are live, set `NEXT_PUBLIC_ADMIN_URL` on marketing and `NEXT_PUBLIC_MARKETING_URL` on admin to each other's real URLs, and redeploy both.

## Duplicated files and the manual-sync cost

There is deliberately no shared package between the two apps (per the project's own requirement — plain npm workspaces only). A handful of files exist as **separate, duplicated copies** in both `apps/marketing` and `apps/admin`:

- `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/admin.ts`
- `lib/database.types.ts` (Supabase-generated types)
- `lib/utils.ts`
- `components/ui/*` (shadcn primitives)
- `config/brand.config.ts` (design tokens)

**Whenever the Supabase schema changes**, regenerate types and copy the result into both apps:

```bash
supabase gen types typescript --project-id <project-ref> > apps/marketing/lib/database.types.ts
supabase gen types typescript --project-id <project-ref> > apps/admin/lib/database.types.ts
```

If RLS policies or the shape of any of the duplicated Supabase client files changes, apply the same edit to both copies by hand. There is no build-time check that catches drift between them — treat this as a manual checklist item on any schema-affecting PR.

## Cross-app data flow

Bookings, clients, blog posts, etc. are rows in the shared Supabase database — not tied to either app's process. A booking created through marketing's `/client/*` flow is immediately visible in admin's dashboard because both apps query the same tables; nothing about seeing or tracking data depends on which app a user is logged into.

**Known gap:** admin's server actions used to call `revalidatePath()` on public marketing routes (e.g. after publishing a blog post) when everything ran in one Next.js process. That no longer works across two separate deployments — those calls were removed during the split (see comments left at each call site in `apps/admin`) and public pages will only pick up changes on their own ISR/cache schedule. If near-instant publish-to-live is needed, this needs a follow-up (e.g. a webhook from admin to a marketing revalidation API route).

## Repo-root files worth knowing about

- `supabase/migrations/` — SQL migrations, already isolated from app code, untouched by this split.
- `repair_admin.sql` — a one-off manual repair script at repo root, not part of the migrations folder; kept as-is.
- `scripts/*.js` — standalone Node scripts (create-developer, seed-equipment, etc.), run manually against the DB, not part of either app's build.
- `scratch.ts` at repo root references `./lib/payroll-engine`, which no longer exists at root (it moved into `apps/admin/lib` during the split). This file is dead/orphaned — safe to delete, or update its import path if it's still useful as a manual test script.
