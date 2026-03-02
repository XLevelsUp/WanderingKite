/**
 * Deployment Triad Types
 * ----------------------
 * TypeScript interfaces for the Field Operations & Equipment Tracking page.
 * All column names mirror the camelCase convention used in the existing schema.
 */

// ── Raw DB rows ────────────────────────────────────────────────────────────

export type AssignmentStatus = 'in_field' | 'returned' | 'maintenance';

/** Minimal profile projection — only fields needed on the triad view */
export interface EmployeeRef {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
}

/** Minimal equipment projection — includes category via join */
export interface EquipmentRef {
  id: string;
  name: string;
  serialNumber: string;
  status: string;
  categories: { name: string } | null;
}

/** Minimal client projection */
export interface ClientRef {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

// ── Joined / enriched row ──────────────────────────────────────────────────

/** The full triad row returned by getActiveDeployments() */
export interface ActiveAssignment {
  id: string;
  status: AssignmentStatus;
  location: string | null;
  notes: string | null;
  assignedAt: string;
  expectedReturn: string | null;
  returnedAt: string | null;

  /** Employee who possesses the gear */
  employee: EmployeeRef;

  /** Gear item */
  equipment: EquipmentRef;

  /** Client / project the gear is deployed to (nullable for internal moves) */
  client: ClientRef | null;

  /** Derived at the server layer — true when expectedReturn < now() */
  isOverdue: boolean;
}

// ── UI grouping ────────────────────────────────────────────────────────────

/** The shape consumed by DeploymentMatrix — assignments grouped by employee */
export interface EmployeeDeploymentGroup {
  employee: EmployeeRef;
  assignments: ActiveAssignment[];
  /** Total items this employee currently holds (convenience counter) */
  totalItems: number;
  /** True if any assignment in this group is overdue */
  hasOverdue: boolean;
}
