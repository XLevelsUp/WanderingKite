import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  getActiveDeployments,
  getAssignmentFormData,
} from '@/actions/deployments';
import { DeploymentMatrix } from '@/components/deployments/DeploymentMatrix';
import { AssignEquipmentModal } from '@/components/deployments/AssignEquipmentModal';
import { Radio, Camera, Users, AlertTriangle, Package, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Field Operations — Studio ERP',
  description:
    'Real-time triad view of employee, equipment, and client deployments.',
};

// Always revalidate: deployments are live operational data
export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────
// Stat card (no client JS needed — pure markup)
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 rounded-xl border
        ${
          accent
            ? 'bg-amber-500/[0.05] border-amber-500/20'
            : 'bg-white/[0.02] border-white/8'
        }`}
    >
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-lg
          ${accent ? 'bg-amber-500/15' : 'bg-primary/10'}`}
      >
        <Icon
          className={`w-5 h-5 ${accent ? 'text-amber-400' : 'text-primary/70'}`}
        />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground/90 tabular-nums">
          {value}
        </p>
        <p className="text-xs text-foreground/40 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Component (Wrapped in Suspense)
// ─────────────────────────────────────────────────────────────────────────────

async function DeploymentsData({ isAdmin }: { isAdmin: boolean }) {
  // Fetch active deployments + form data in parallel
  const [groups, formData] = await Promise.all([
    getActiveDeployments(),
    getAssignmentFormData(),
  ]);

  // Aggregate stats from groups (zero extra DB round-trips)
  const totalDeployments = groups.reduce((acc, g) => acc + g.totalItems, 0);
  const activeEmployees = groups.length;
  const overdueCount = groups.reduce(
    (acc, g) => acc + g.assignments.filter((a) => a.isOverdue).length,
    0
  );

  return (
    <>
      <div className="flex items-center gap-3 flex-shrink-0 mt-1 absolute right-0 top-0">
        <AssignEquipmentModal
          employees={formData.employees as any}
          equipment={formData.equipment as any}
          clients={formData.clients as any}
        />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-foreground/40 font-medium">Live</span>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <StatCard
          icon={Package}
          label="Active Deployments"
          value={totalDeployments}
        />
        <StatCard
          icon={Users}
          label="Photographers in Field"
          value={activeEmployees}
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue Returns"
          value={overdueCount}
          accent={overdueCount > 0}
        />
      </div>

      {/* ── Section Label ── */}
      <div className="flex items-center gap-3 mt-8">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-foreground/30" />
          <span className="text-xs font-semibold text-foreground/35 uppercase tracking-widest">
            Deployment Matrix
          </span>
        </div>
        <div className="flex-1 h-px bg-white/6" />
        <span className="text-xs text-foreground/25 tabular-nums">
          {totalDeployments} item{totalDeployments !== 1 ? 's' : ''} across{' '}
          {activeEmployees} employee{activeEmployees !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Deployment Matrix ── */}
      <div className="mt-8">
        <DeploymentMatrix groups={groups} isAdmin={isAdmin} />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function DeploymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch profile for role-gating
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';

  return (
    <div className="relative space-y-8 min-h-[500px]">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/12 ring-1 ring-primary/20">
              <Radio className="w-4.5 h-4.5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground/90 tracking-tight">
              Field Operations
            </h1>
          </div>
          <p className="text-sm text-foreground/45 ml-11.5">
            Live deployment matrix — equipment currently in the field
          </p>
        </div>
      </div>

      <Suspense 
        fallback={
          <div className="flex flex-col items-center justify-center py-20 text-foreground/40 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
            <p className="text-sm font-medium animate-pulse">Loading field operations...</p>
          </div>
        }
      >
        <DeploymentsData isAdmin={isAdmin} />
      </Suspense>
    </div>
  );
}
