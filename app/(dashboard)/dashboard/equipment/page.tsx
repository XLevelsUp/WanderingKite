import { getEquipmentWithFieldStatus } from '@/actions/equipment';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import Image from 'next/image';
import { User, MapPin, Radio, Package, Loader2 } from 'lucide-react';
import { DeleteEquipmentButton } from '@/components/dashboard/DeleteEquipmentButton';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { hasAccess } from '@/lib/access';

export const dynamic = 'force-dynamic';

// ── Equipment-status badge ────────────────────────────────────────────────────

type EquipStatus =
  | 'AVAILABLE'
  | 'IN_USE'
  | 'MAINTENANCE'
  | 'RENTED'
  | 'LOST'
  | string;

function EquipmentStatusBadge({ status }: { status: EquipStatus }) {
  const map: Record<string, { label: string; cls: string }> = {
    AVAILABLE: {
      label: 'Available',
      cls: 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25',
    },
    IN_USE: {
      label: 'In Use',
      cls: 'bg-blue-500/12 text-blue-400 border border-blue-500/25',
    },
    RENTED: {
      label: 'Rented',
      cls: 'bg-violet-500/12 text-violet-400 border border-violet-500/25',
    },
    MAINTENANCE: {
      label: 'Maintenance',
      cls: 'bg-amber-500/12 text-amber-400 border border-amber-500/25',
    },
    LOST: {
      label: 'Lost',
      cls: 'bg-red-500/12 text-red-400 border border-red-500/25',
    },
  };
  const cfg = map[status] ?? {
    label: status,
    cls: 'bg-white/5 text-foreground/40 border border-white/10',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'AVAILABLE'
            ? 'bg-emerald-400'
            : status === 'IN_USE'
              ? 'bg-blue-400'
              : status === 'MAINTENANCE'
                ? 'bg-amber-400'
                : status === 'RENTED'
                  ? 'bg-violet-400'
                  : 'bg-red-400'
        }`}
      />
      {cfg.label}
    </span>
  );
}

// ── "In Field" enrichment cell ────────────────────────────────────────────────

interface ActiveAssignment {
  id: string;
  status: string;
  assignedAt: string;
  expectedReturn: string | null;
  location: string | null;
  employee: { id: string; fullName: string | null; email: string } | null;
  client: { id: string; name: string; phone: string | null } | null;
}

function FieldStatusCell({
  assignment,
}: {
  assignment: ActiveAssignment | null;
}) {
  if (!assignment) {
    return <span className="text-xs text-foreground/25 italic">—</span>;
  }

  const now = Date.now();
  const isOverdue =
    assignment.expectedReturn != null &&
    new Date(assignment.expectedReturn).getTime() < now;

  return (
    <div className="space-y-1.5">
      {/* Assignment status badge */}
      <div className="flex items-center gap-1.5">
        <Radio
          className={`w-3 h-3 flex-shrink-0 ${isOverdue ? 'text-amber-400' : 'text-blue-400'}`}
        />
        <span
          className={`text-xs font-semibold ${isOverdue ? 'text-amber-400' : 'text-blue-400'}`}
        >
          {isOverdue
            ? 'Overdue'
            : assignment.status === 'in_field'
              ? 'In Field'
              : 'Maintenance'}
        </span>
      </div>

      {/* Who has it */}
      {assignment.employee && (
        <div className="flex items-center gap-1 text-[11px] text-foreground/50">
          <User className="w-3 h-3 flex-shrink-0 text-foreground/30" />
          <span className="truncate max-w-[120px]">
            {assignment.employee.fullName ?? assignment.employee.email}
          </span>
        </div>
      )}

      {/* Client or location */}
      {(assignment.client || assignment.location) && (
        <div className="flex items-center gap-1 text-[11px] text-foreground/40">
          <MapPin className="w-3 h-3 flex-shrink-0 text-foreground/25" />
          <span className="truncate max-w-[120px]">
            {assignment.client?.name ?? assignment.location}
          </span>
        </div>
      )}

      {/* Expected return */}
      {assignment.expectedReturn && (
        <p
          className={`text-[10px] ml-4 ${isOverdue ? 'text-amber-400/70' : 'text-foreground/30'}`}
        >
          Due:{' '}
          {new Date(assignment.expectedReturn).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Component (Wrapped in Suspense)
// ─────────────────────────────────────────────────────────────────────────────

async function EquipmentData({ isEmployee, isSuperAdmin }: { isEmployee: boolean, isSuperAdmin: boolean }) {
  const equipment = await getEquipmentWithFieldStatus();
  const inFieldCount = equipment.filter(
    (e) => e.activeAssignment !== null
  ).length;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
          <p className="text-foreground/40 mt-2 text-sm">
            Manage your rental equipment inventory
            {inFieldCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-blue-400">
                · <Radio className="w-3 h-3" /> {inFieldCount} currently in
                field
              </span>
            )}
          </p>
        </div>
        {!isEmployee && (
          <Link href="/dashboard/equipment/new">
            <Button>Add Equipment</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Equipment</CardTitle>
          <CardDescription>
            {equipment.length} items in inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Inventory Status</TableHead>
                <TableHead>Field Status</TableHead>
                <TableHead>Rental Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-foreground/40 py-8"
                  >
                    No equipment found. Add your first item to get started.
                  </TableCell>
                </TableRow>
              ) : (
                equipment.map((item) => (
                  <TableRow
                    key={item.id}
                    className={
                      item.activeAssignment ? 'bg-blue-500/[0.02]' : ''
                    }
                  >
                    {/* Thumbnail */}
                    <TableCell className="w-12 pr-0">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border bg-muted/40 shrink-0">
                        {(item as any).image_url ? (
                          <Image
                            src={(item as any).image_url}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                            sizes="40px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground/60">
                      {item.serialNumber}
                    </TableCell>
                    <TableCell className="text-foreground/60">
                      {(item.categories as any)?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <EquipmentStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <FieldStatusCell assignment={item.activeAssignment} />
                    </TableCell>
                    <TableCell className="text-foreground/70 text-xs">
                      {(() => {
                        const plans = Array.isArray(item.pricingPlans) ? (item.pricingPlans as any[]) : [];
                        if (plans.length === 0) return '—';
                        
                        const hourly = plans.find((p: any) => p.name?.toLowerCase() === 'hourly');
                        const daily = plans.find((p: any) => p.name?.toLowerCase() === 'daily');
                        
                        const parts = [];
                        if (hourly) {
                          parts.push(`₹${Number(hourly.rate).toLocaleString('en-IN')}/hr`);
                        }
                        if (daily) {
                          parts.push(`₹${Number(daily.rate).toLocaleString('en-IN')}/day`);
                        }
                        
                        if (parts.length > 0) {
                          return parts.join(' · ');
                        }
                        
                        // Fallback to first plan in list
                        const first = plans[0];
                        return `₹${Number(first.rate).toLocaleString('en-IN')} (${first.name})`;
                      })()}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Link href={`/dashboard/equipment/${item.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      {isSuperAdmin && (
                        <DeleteEquipmentButton
                          equipmentId={item.id}
                          equipmentName={item.name}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function EquipmentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isEmployee = profile?.role === 'EMPLOYEE';
  const isSuperAdmin = profile?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-8 min-h-[500px]">
      <Suspense 
        fallback={
          <div className="flex flex-col items-center justify-center py-20 text-foreground/40 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
            <p className="text-sm font-medium animate-pulse">Loading equipment inventory...</p>
          </div>
        }
      >
        <EquipmentData isEmployee={isEmployee} isSuperAdmin={isSuperAdmin} />
      </Suspense>
    </div>
  );
}
