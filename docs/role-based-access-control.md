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
| `SUPER_ADMIN` | 2 | Owners / system admins | Everything, incl. clients & audit logs |
| `ADMIN` | 1 | Operations / HR managers | HR, payroll, rentals, portfolio, ops dashboards |
| `EMPLOYEE` | 0 | Staff members | Own profile, own payslips, equipment, field ops |

Roles are **hierarchical**: a higher role automatically satisfies any
requirement met by a lower role (`userRank >= requiredRank`).

**Default / fallback role:** if a user's role is missing or unrecognized, the
code treats them as `EMPLOYEE` (the least-privileged role) — fail-safe by
default.

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
| `/dashboard/clients` | SUPER_ADMIN |
| `/dashboard/audit-logs` | SUPER_ADMIN |
| `/admin` | ADMIN |
| `/admin/employees` | ADMIN |
| `/admin/attendance` | ADMIN |
| `/admin/payroll` | ADMIN |
| `/admin/payroll/payslip` | EMPLOYEE (own detailed payslip) |

> **Unlisted routes are public** — `hasAccess()` allows any path that has no
> matching rule. Add a rule when you create a page that must be restricted.

---

## 4. Sidebar navigation visibility

`ROLE_NAV_ACCESS` in [`lib/access.ts`](../lib/access.ts) controls which links
each role sees in the dashboard sidebar (via `getNavAccess()` used by
[`components/dashboard/SidebarNav.tsx`](../components/dashboard/SidebarNav.tsx)).

| Capability | EMPLOYEE | ADMIN | SUPER_ADMIN |
|------------|:-------:|:-----:|:-----------:|
| View employees | ✅ (own) | ✅ | ✅ |
| View equipment | ✅ | ✅ | ✅ |
| View deployments / field ops | ✅ | ✅ | ✅ |
| Own payslips | ✅ | — | — |
| Own attendance | ✅ | — | — |
| View clients | — | — | ✅ |
| View rentals | — | ✅ | ✅ |
| View portfolio | — | ✅ | ✅ |
| HR access | — | ✅ | ✅ |
| Audit logs | — | — | ✅ |
| Admin extras (categories, branches) | — | ✅ | ✅ |
| Rental settings | — | ✅ | ✅ |

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
