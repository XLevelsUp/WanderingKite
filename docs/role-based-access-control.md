# Role-Based Access Control (RBAC) — Wandering Kite

This document describes how access control works in the Wandering Kite application:
the roles that exist, what each role can do, and how access is enforced in code.

> **Source of truth:** [`lib/access.ts`](../lib/access.ts) is the single source of
> truth for staff/internal role permissions. Update that file when changing
> internal permissions, and keep this document in sync.

---

## 1. Two separate authentication realms

The app has **two independent login systems**. They use different session
mechanisms and never share roles.

| Realm | Who | Auth system | Session cookie | Protected paths |
|-------|-----|-------------|----------------|-----------------|
| **Internal / Staff** | Employees, admins | **Supabase Auth** (`profiles.role`) | Supabase cookies | `/dashboard/*`, `/admin/*` |
| **Customer / Client** | Rental & booking customers | **NextAuth v5** (credentials) | `authjs.session-token` | `/client/*` |

- **Staff** sign in at **`/login`**.
- **Clients** sign in at **`/client/login`** and sign up at **`/client/signup`**.

Because they are separate, a logged-in client is *not* a staff user and vice
versa. The middleware even handles the crossover case (a staff member landing on
a `/client` page is redirected to `/dashboard`).

---

## 2. Roles

### 2.1 Staff roles (Supabase `profiles.role`)

Defined by `AppRole` in [`lib/access.ts`](../lib/access.ts). Listed highest →
lowest privilege:

| Role | Rank | Intended for | Scope summary |
|------|------|--------------|---------------|
| `DEVELOPER` | 3 | Engineering / platform maintainers | Everything SUPER_ADMIN has, plus exclusive audit-log visibility. Never tracked. |
| `SUPER_ADMIN` | 2 | Owners / system admins | Everything except audit logs — see 2.1a |
| `ADMIN` | 1 | Operations / HR managers | HR, payroll, rentals, portfolio, ops dashboards |
| `EMPLOYEE` | 0 | Staff members | Own profile, own payslips, equipment, field ops |

Roles are **hierarchical**: a higher role automatically satisfies any
requirement met by a lower role (`userRank >= requiredRank`).

**Default / fallback role:** if a user's role is missing or unrecognized, the
code treats them as `EMPLOYEE` (the least-privileged role) — fail-safe by
default.

### 2.1a The DEVELOPER role

`DEVELOPER` is a real, first-class value in the Postgres `"UserRole"` enum
(see migration `00047_developer_role.sql`) — not a disguised `SUPER_ADMIN`
with a hidden marker column. Every RLS policy and inline role check that
grants access to `ADMIN`/`SUPER_ADMIN` explicitly lists `'DEVELOPER'` too, so
it has no restrictions anywhere in the app or database, with two deliberate
exceptions:

1. **Never tracked.** `startSession()` ([`actions/session-tracking.ts`](../actions/session-tracking.ts)),
   the click-ingest route ([`app/api/track/click/route.ts`](../app/api/track/click/route.ts)),
   and `writeAuditLog()` ([`lib/audit.ts`](../lib/audit.ts)) each check
   `profiles.role === 'DEVELOPER'` and no-op. `SessionTracker`/`ClickTracker`
   are also simply not mounted in the dashboard/admin layouts for a developer
   account, as a client-side nicety (the server-side checks are the real
   enforcement — a removed client component is not a security boundary).
2. **Exclusive audit/activity visibility.** Login activity, click analytics,
   the equipment-clash log, and the data-change audit log
   (`/dashboard/audit-logs`) are visible **only** to `DEVELOPER` — a real
   `SUPER_ADMIN` cannot view them. See Section 3a.

`DEVELOPER` is never selectable anywhere in the employee-management UI (no
role dropdown option, no signup flow). It is provisioned exclusively via
[`scripts/create-developer.js`](../scripts/create-developer.js), which
creates a Supabase Auth user and sets `profiles.role = 'DEVELOPER'` directly.

### 2.2 Client role (NextAuth)

| Role | Auth system | Scope |
|------|-------------|-------|
| `client` | NextAuth | Own client dashboard, bookings, and rentals under `/client/*` |

The client role is assigned on login in [`auth.ts`](../auth.ts) and read in
middleware / pages via the shared config in [`auth.config.ts`](../auth.config.ts).

---

## 3. Route access matrix (staff)

From `ROUTE_ACCESS` in [`lib/access.ts`](../lib/access.ts). The value is the
**minimum role** required. Matching uses the **longest matching prefix** (so a
more specific route overrides a general one).

| Route (prefix) | Minimum role |
|----------------|--------------|
| `/dashboard` | EMPLOYEE |
| `/dashboard/employees` | EMPLOYEE (read-only for EMPLOYEE) |
| `/dashboard/payslips` | EMPLOYEE |
| `/dashboard/attendance` | EMPLOYEE |
| `/dashboard/equipment` | EMPLOYEE |
| `/dashboard/fieldops` | EMPLOYEE |
| `/dashboard/rentals` | ADMIN |
| `/dashboard/categories` | ADMIN |
| `/dashboard/branches` | ADMIN |
| `/dashboard/portfolio` | ADMIN |
| `/dashboard/rental-settings` | ADMIN |
| `/dashboard/clients` | ADMIN |
| `/dashboard/booking-conflicts` | ADMIN |
| `/dashboard/invoices` | ADMIN |
| `/dashboard/studio-pricing` | ADMIN |
| `/admin` | ADMIN |
| `/admin/employees` | ADMIN |
| `/admin/attendance` | ADMIN |
| `/admin/payroll` | ADMIN |
| `/admin/payroll/payslip` | EMPLOYEE (own detailed payslip) |
| `/dashboard/audit-logs` | DEVELOPER (not even SUPER_ADMIN) |

> **Unlisted routes are public** — `hasAccess()` allows any path that has no
> matching rule. Add a rule when you create a page that must be restricted.

### 3a. Audit logs are DEVELOPER-only, not SUPER_ADMIN-only

`/dashboard/audit-logs` (login activity, click analytics, data-change audit
log, equipment clash logs) requires `role === 'DEVELOPER'` directly — a real
`SUPER_ADMIN` is redirected to `/dashboard` even though `SUPER_ADMIN` outranks
every other route's minimum role. This is intentional: a super admin's own
logins/clicks/data changes are still recorded (Section 2.1a), so letting a
super admin read those logs would let them view a trail that includes
themselves — deliberately restricted to `DEVELOPER` instead.

Enforcement mirrors across every layer:
- Page: `app/(dashboard)/dashboard/audit-logs/page.tsx` redirects unless
  `profile.role === 'DEVELOPER'`.
- Server actions: `actions/activity.ts` (`getLoginActivity`, `getClickEvents`,
  `getClickLeaderboard`, `getAuditLog`) and `actions/audit.ts`
  (`getAuditClashLogs`) each independently call a `requireDeveloper()` guard.
- RLS: the `SELECT` policies on `audit_logs`, `user_sessions`, and
  `click_events` (migration `00047_developer_role.sql`) check
  `get_user_role(auth.uid()) = 'DEVELOPER'` instead of `'SUPER_ADMIN'`.

**Studio booking conflict resolution was split out** to its own page,
`/dashboard/booking-conflicts` (ADMIN+), because it is an operational task
(approving/rejecting overlapping bookings), not log-viewing — it stays
available to ADMIN/SUPER_ADMIN/DEVELOPER even though the rest of the
audit-logs page is DEVELOPER-only. `getStudioBookingConflicts()` and
`resolveStudioBookingConflict()` in `actions/audit.ts` use `requireAdmin()`,
unrelated to the developer-only gate.

---

## 4. Sidebar navigation visibility

`ROLE_NAV_ACCESS` in [`lib/access.ts`](../lib/access.ts) controls which links
each role sees in the dashboard sidebar (via `getNavAccess()` used by
[`components/dashboard/SidebarNav.tsx`](../components/dashboard/SidebarNav.tsx)).

| Capability | EMPLOYEE | ADMIN | SUPER_ADMIN | DEVELOPER |
|------------|:-------:|:-----:|:-----------:|:---------:|
| View employees | ✅ (own) | ✅ | ✅ | ✅ |
| View equipment | ✅ | ✅ | ✅ | ✅ |
| View deployments / field ops | ✅ | ✅ | ✅ | ✅ |
| Own payslips | ✅ | — | — | — |
| Own attendance | ✅ | — | — | — |
| View clients | — | ✅ | ✅ | ✅ |
| View rentals | — | ✅ | ✅ | ✅ |
| View portfolio | — | ✅ | ✅ | ✅ |
| HR access | — | ✅ | ✅ | ✅ |
| Booking conflicts | — | ✅ | ✅ | ✅ |
| Invoices | — | ✅ | ✅ | ✅ |
| Audit logs | — | — | — | ✅ |
| Admin extras (categories, branches) | — | ✅ | ✅ | ✅ |
| Rental settings | — | ✅ | ✅ | ✅ |

> **Note:** hiding a nav link is a UX convenience, **not** a security boundary.
> Real enforcement happens server-side (Section 5). Never rely on the sidebar
> alone to protect a page.

---

## 5. How access is enforced (defense in depth)

Access is checked at multiple layers:

### Layer 1 — Middleware ([`middleware.ts`](../middleware.ts))
Runs on every request:
- Adds `X-Robots-Tag: noindex, nofollow` to internal paths
  (`/admin`, `/dashboard`, `/api`, `/auth`, `/client`).
- **Client paths (`/client/*`):** reads the NextAuth session via the shared
  `auth.config.ts` and requires `role === 'client'`; otherwise redirects to
  `/client/login`. A staff user (Supabase session) is redirected to `/dashboard`.
- **Staff paths:** `updateSession()`
  ([`lib/supabase/middleware.ts`](../lib/supabase/middleware.ts)) redirects
  unauthenticated visitors of `/dashboard` and `/admin` to `/login`.

### Layer 2 — Layout guard ([`app/(dashboard)/layout.tsx`](../app/(dashboard)/layout.tsx))
The dashboard layout re-checks `supabase.auth.getUser()` server-side and
redirects to `/login` if there is no user, then loads the user's `profile.role`.

### Layer 3 — Per-page role check
Restricted pages call `hasAccess(role, route)` and redirect to `/dashboard` if
the role is insufficient. Standard pattern:

```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/login');

const { data: profile } = await supabase
  .from('profiles').select('*').eq('id', user.id).single();

if (!hasAccess(profile?.role ?? 'EMPLOYEE', '/dashboard/rentals')) {
  redirect('/dashboard');
}
```

### Layer 4 — Database (Supabase RLS)
Supabase Row-Level Security policies enforce data access at the database level.
Privileged server actions that must bypass RLS use the service-role
`adminAuthClient` ([`lib/supabase/admin.ts`](../lib/supabase/admin.ts)) — these
run only in trusted server code, never on the client.

---

## 6. Access-decision flow

```
Request
  │
  ├─ /client/*  ──► NextAuth session? ──no──► redirect /client/login
  │                     │ role==='client'? ──no (staff)──► redirect /dashboard
  │                     └─ yes ──► allow
  │
  └─ /dashboard/* or /admin/*
        │ Supabase user? ──no──► redirect /login
        │ load profile.role (default EMPLOYEE)
        │ hasAccess(role, path)? ──no──► redirect /dashboard
        └─ yes ──► render page (RLS still applies at the DB)
```

---

## 7. Adding a new restricted page

1. Add a route entry to `ROUTE_ACCESS` in [`lib/access.ts`](../lib/access.ts)
   with the minimum role.
2. In the page, after loading the user + `profile.role`, call
   `hasAccess(role, '/your/route')` and `redirect('/dashboard')` when it returns
   `false`.
3. If the page needs a sidebar link, add the capability flag to
   `ROLE_NAV_ACCESS` and use it in `SidebarNav`.
4. Keep this document updated.

> Historical note: the header comment in `lib/access.ts` references a
> `requireAccess()` helper. In the current codebase enforcement is done with the
> `hasAccess()` + `redirect()` pattern shown above; there is no `requireAccess()`
> function. Consider adding one as a small refactor to reduce repetition.

---

## 8. Security reminders

- **`NEXTAUTH_SECRET` must be set in every environment** (esp. Vercel
  production). Without it, the code falls back to a hardcoded default that is
  visible in the public repo — allowing session forgery. Set a private value in
  the hosting env vars.
- Nav visibility is cosmetic — always enforce on the server.
- Never expose the service-role Supabase key to the client; it bypasses RLS.
- `scripts/create-developer.js` requires `NEXT_PUBLIC_SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY` as environment variables (loaded via
  `node --env-file=.env.local ...`) — never hardcode credentials into a
  script that gets committed. `scripts/seed-equipment.js` currently does
  hardcode a service-role key in plaintext; that should be rotated and fixed
  separately from this change.
