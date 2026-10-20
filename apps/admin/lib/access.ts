/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ACCESS CONTROL CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This is the single source of truth for all role-based permissions.
 *
 * Roles (from highest to lowest privilege):
 *   DEVELOPER   → Full system access, no restrictions. Never tracked (see
 *                 lib/audit.ts, actions/session-tracking.ts, click route).
 *                 Exclusive audit-log visibility — see canViewAuditLogs below.
 *                 Not selectable anywhere in the UI; seeded only via
 *                 scripts/create-developer.js.
 *   SUPER_ADMIN → Full system access including settings, billing. Does NOT
 *                 see audit logs / login activity / click analytics — those
 *                 are DEVELOPER-only now, since a super admin's own actions
 *                 are still tracked.
 *   ADMIN       → HR & Payroll, employee management, operational dashboards
 *   EMPLOYEE    → Own profile, own payslips only
 *
 * How to add a new page:
 *   1. Add a route entry in ROUTE_ACCESS below.
 *   2. Call `requireAccess(role, '/your/route')` at the top of the page.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type AppRole =
  | 'DEVELOPER'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EMPLOYEE'
  | 'MARKETING';

// Role hierarchy — higher index = higher privilege.
//
// MARKETING is deliberately OFF this ladder. It is a sideways role: blog
// access only, and nothing else — not even the EMPLOYEE-level pages. Ranking
// it would either hand it unrelated sections (at ADMIN) or deny it the blog
// (at EMPLOYEE), so it is granted through ROLE_ROUTE_ALLOWLIST instead and
// pinned at rank 0 here so any rank comparison fails closed.
const ROLE_RANK: Record<AppRole, number> = {
  EMPLOYEE: 0,
  MARKETING: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
  DEVELOPER: 3,
};

/**
 * Routes granted to a role OUTSIDE the rank hierarchy.
 *
 * A role listed here can reach the given prefixes regardless of rank, and —
 * crucially — reaches ONLY those prefixes: a role with an allowlist is denied
 * every route not on it, so MARKETING cannot fall back to EMPLOYEE-level
 * pages like /dashboard/equipment.
 */
export const ROLE_ROUTE_ALLOWLIST: Partial<Record<AppRole, readonly string[]>> = {
  MARKETING: ['/', '/blog'],
};

/**
 * Route access map.
 * Key   → route prefix (e.g. '/hr' covers all /hr/* routes)
 * Value → minimum role required to access that route
 */
export const ROUTE_ACCESS: Record<string, AppRole> = {
  // ── Employee self-service (all logged-in users) ──────────────────────────
  '/':                'EMPLOYEE',
  '/employees':       'EMPLOYEE',   // Employee list (read-only for EMPLOYEE)
  '/payslips':        'EMPLOYEE',
  '/attendance':       'EMPLOYEE',

  // ── Admin operational pages ──────────────────────────────────────────────
  '/equipment':       'EMPLOYEE',
  '/fieldops':        'EMPLOYEE',
  '/media-tracker':   'EMPLOYEE',
  '/clients':         'ADMIN',
  '/invoices':        'ADMIN',
  '/booking-conflicts': 'ADMIN',
  '/rentals':         'ADMIN',
  '/categories':      'ADMIN',
  '/branches':        'ADMIN',
  '/portfolio':       'ADMIN',
  // ADMIN+ by rank; MARKETING also reaches it via ROLE_ROUTE_ALLOWLIST.
  '/blog':            'ADMIN',

  // ── HR & Payroll (admin only) ────────────────────────────────────────────
  '/hr':                    'ADMIN',
  '/hr/employees':          'ADMIN',
  '/hr/attendance':         'ADMIN',
  '/hr/payroll':            'ADMIN',
  '/hr/payroll/payslip':    'EMPLOYEE', // Allow employees to view their own detailed payslip
  '/rental-settings': 'ADMIN',
  '/studio-pricing':  'ADMIN',

  // ── Developer only ────────────────────────────────────────────────────────
  '/audit-logs':      'DEVELOPER', // Login activity, click analytics, data-change audit log — not even SUPER_ADMIN
};

/**
 * What each role can see in the sidebar navigation.
 * Used by SidebarNav to render only the relevant links.
 */
export const ROLE_NAV_ACCESS = {
  EMPLOYEE: {
    canViewEmployees: true,       // Own profile only
    canViewEquipment: true,
    canViewDeployments: true,
    canViewOwnPayslips: true,
    canViewOwnAttendance: true,
    canViewClients: false,
    canViewRentals: false,
    canViewPortfolio: false,
    canAccessHR: false,
    canViewAuditLogs: false,
    canViewAdminExtras: false,    // Categories, Branches
    canViewRentalSettings: false,
    canViewMediaTracker: true,    // View-only — CRUD hidden inline for this role
    canViewBookingConflicts: false,
    canViewInvoices: false,
    canViewStudioPricing: false,
    canViewBlog: false,
  },
  // Blog only. Every other flag is false by design — see ROLE_ROUTE_ALLOWLIST.
  MARKETING: {
    canViewEmployees: false,
    canViewEquipment: false,
    canViewDeployments: false,
    canViewOwnPayslips: false,
    canViewOwnAttendance: false,
    canViewClients: false,
    canViewRentals: false,
    canViewPortfolio: false,
    canAccessHR: false,
    canViewAuditLogs: false,
    canViewAdminExtras: false,
    canViewRentalSettings: false,
    canViewMediaTracker: false,
    canViewBookingConflicts: false,
    canViewInvoices: false,
    canViewStudioPricing: false,
    canViewBlog: true,
  },
  ADMIN: {
    canViewEmployees: true,
    canViewEquipment: true,
    canViewDeployments: true,
    canViewOwnPayslips: false,
    canViewOwnAttendance: false,
    canViewClients: true,
    canViewRentals: true,
    canViewPortfolio: true,
    canAccessHR: true,
    canViewAuditLogs: false,
    canViewAdminExtras: true,
    canViewRentalSettings: true,
    canViewMediaTracker: true,
    canViewBookingConflicts: true,
    canViewInvoices: true,
    canViewStudioPricing: true,

    canViewBlog: true,
  },
  SUPER_ADMIN: {
    canViewEmployees: true,
    canViewEquipment: true,
    canViewDeployments: true,
    canViewOwnPayslips: false,
    canViewOwnAttendance: false,
    canViewClients: true,
    canViewRentals: true,
    canViewPortfolio: true,
    canAccessHR: true,
    canViewAuditLogs: false,
    canViewAdminExtras: true,
    canViewRentalSettings: true,
    canViewMediaTracker: true,
    canViewBookingConflicts: true,
    canViewInvoices: true,
    canViewStudioPricing: true,

    canViewBlog: true,
  },
  DEVELOPER: {
    canViewEmployees: true,
    canViewEquipment: true,
    canViewDeployments: true,
    canViewOwnPayslips: false,
    canViewOwnAttendance: false,
    canViewClients: true,
    canViewRentals: true,
    canViewPortfolio: true,
    canAccessHR: true,
    canViewAuditLogs: true,
    canViewAdminExtras: true,
    canViewRentalSettings: true,
    canViewMediaTracker: true,
    canViewBookingConflicts: true,
    canViewInvoices: true,
    canViewStudioPricing: true,

    canViewBlog: true,
  },
} satisfies Record<AppRole, Record<string, boolean>>;

/**
 * Check if a role has access to a given route.
 * Matches by longest-prefix rule.
 */
export function hasAccess(role: string, path: string): boolean {
  const appRole = role as AppRole;
  const userRank = ROLE_RANK[appRole] ?? 0;

  // Roles with an explicit allowlist are governed ONLY by it — they never
  // fall through to the rank comparison, so a sideways role like MARKETING
  // cannot pick up unrelated routes that happen to sit at its rank.
  const allowlist = ROLE_ROUTE_ALLOWLIST[appRole];
  if (allowlist) {
    return allowlist.some(
      (route) => path === route || path.startsWith(route + '/')
    );
  }

  // Find the most specific (longest) matching route prefix
  const matchedRoute = Object.keys(ROUTE_ACCESS)
    .filter((route) => path === route || path.startsWith(route + '/'))
    .sort((a, b) => b.length - a.length)[0];

  if (!matchedRoute) return true; // No rule = public route, allow

  const requiredRole = ROUTE_ACCESS[matchedRoute];
  const requiredRank = ROLE_RANK[requiredRole] ?? 0;

  return userRank >= requiredRank;
}

/**
 * Returns the nav access config for a given role.
 */
export function getNavAccess(role: string) {
  const appRole = (role as AppRole) in ROLE_NAV_ACCESS ? (role as AppRole) : 'EMPLOYEE';
  return ROLE_NAV_ACCESS[appRole];
}

/**
 * Media tracker create/edit/delete rights are ADMIN+ by default, but can
 * also be granted to an individual EMPLOYEE via profiles.can_manage_media_tracker
 * — a per-user override independent of the role hierarchy above. Viewing the
 * media tracker pages themselves is unaffected (already open to EMPLOYEE via
 * ROUTE_ACCESS); this only gates the manage actions.
 */
export function canManageMediaTracker(role: string, override?: boolean | null): boolean {
  const rank = ROLE_RANK[role as AppRole] ?? 0;
  return rank >= ROLE_RANK.ADMIN || !!override;
}
