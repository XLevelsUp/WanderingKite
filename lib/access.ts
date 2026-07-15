/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ACCESS CONTROL CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This is the single source of truth for all role-based permissions.
 *
 * Roles (from highest to lowest privilege):
 *   SUPER_ADMIN → Full system access including audit logs, settings, billing
 *   ADMIN       → HR & Payroll, employee management, operational dashboards
 *   EMPLOYEE    → Own profile, own payslips only
 *
 * How to add a new page:
 *   1. Add a route entry in ROUTE_ACCESS below.
 *   2. Call `requireAccess(role, '/your/route')` at the top of the page.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';

// Role hierarchy — higher index = higher privilege
const ROLE_RANK: Record<AppRole, number> = {
  EMPLOYEE: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

/**
 * Route access map.
 * Key   → route prefix (e.g. '/admin' covers all /admin/* routes)
 * Value → minimum role required to access that route
 */
export const ROUTE_ACCESS: Record<string, AppRole> = {
  // ── Employee self-service (all logged-in users) ──────────────────────────
  '/dashboard':               'EMPLOYEE',
  '/dashboard/employees':     'EMPLOYEE',   // Employee list (read-only for EMPLOYEE)
  '/dashboard/payslips':      'EMPLOYEE',
  '/dashboard/attendance':    'EMPLOYEE',

  // ── Admin operational pages ──────────────────────────────────────────────
  '/dashboard/equipment':     'EMPLOYEE',
  '/dashboard/fieldops':      'EMPLOYEE',
  '/dashboard/media-tracker': 'EMPLOYEE',
  '/dashboard/clients':       'ADMIN',
  '/dashboard/audit-logs':    'SUPER_ADMIN',
  '/dashboard/rentals':       'ADMIN',
  '/dashboard/categories':    'ADMIN',
  '/dashboard/branches':      'ADMIN',
  '/dashboard/portfolio':     'ADMIN',

  // ── HR & Payroll (admin only) ────────────────────────────────────────────
  '/admin':                   'ADMIN',
  '/admin/employees':         'ADMIN',
  '/admin/attendance':        'ADMIN',
  '/admin/payroll':           'ADMIN',
  '/admin/payroll/payslip':   'EMPLOYEE', // Allow employees to view their own detailed payslip
  '/dashboard/rental-settings': 'ADMIN',

  // ── Super Admin only ─────────────────────────────────────────────────────
  // Removed duplicate /dashboard/audit-logs
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
    canViewAuditLogs: true,
    canViewAdminExtras: true,
    canViewRentalSettings: true,
    canViewMediaTracker: true,
  },
} satisfies Record<AppRole, Record<string, boolean>>;

/**
 * Check if a role has access to a given route.
 * Matches by longest-prefix rule.
 */
export function hasAccess(role: string, path: string): boolean {
  const appRole = role as AppRole;
  const userRank = ROLE_RANK[appRole] ?? 0;

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
