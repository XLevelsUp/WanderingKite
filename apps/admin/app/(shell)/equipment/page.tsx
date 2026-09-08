import { getEquipmentWithFieldStatus, getCategories, getBranches } from '@/actions/equipment-admin';
import { EditEquipmentDialog } from './[id]/EditEquipmentForm';
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
    RETIRED: {
      label: 'Retired',
      cls: 'bg-slate-500/12 text-slate-400 border border-slate-500/25',
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

import { EquipmentFilterBar } from './EquipmentFilterBar';

// ... other imports ...

// ─────────────────────────────────────────────────────────────────────────────
// Data Component (Wrapped in Suspense)
// ─────────────────────────────────────────────────────────────────────────────

async function EquipmentData({ 
  isEmployee, 
  isSuperAdmin, 
  categories, 
  branches,
  searchParams 
}: { 
  isEmployee: boolean; 
  isSuperAdmin: boolean; 
  categories: any[]; 
  branches: any[];
  searchParams?: { q?: string; category?: string; usage?: string };
}) {
  let equipment = await getEquipmentWithFieldStatus();
  
  if (searchParams?.q) {
    const q = searchParams.q.toLowerCase();
    equipment = equipment.filter(e => e.name.toLowerCase().includes(q) || e.serialNumber.toLowerCase().includes(q));
  }
  if (searchParams?.category && searchParams.category !== 'all') {
    equipment = equipment.filter(e => {
      const cat = (e as any).category_name || (e.categories as any)?.name;
      return cat === searchParams.category;
    });
  }

  if (searchParams?.usage && searchParams.usage !== 'all') {
    equipment = equipment.filter(e => {
      if (searchParams.usage === 'rentals') return (e as any).is_rental === true;
      if (searchParams.usage === 'studiospace') return (e as any).is_studio_space === true;
      if (searchParams.usage === 'inhouse') return !(e as any).is_rental && !(e as any).is_studio_space;
      return true;
    });
  }

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
          <Link href="/equipment/new">
            <Button>Add Equipment</Button>
          </Link>
        )}
      </div>

      <EquipmentFilterBar categories={categories} />

      <Card>
        <CardHeader>
          <CardTitle>All Equipment</CardTitle>
          <CardDescription>
            {equipment.length} items found
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
                      {(item as any).category_name || (item.categories as any)?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <EquipmentStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <FieldStatusCell assignment={item.activeAssignment} />
                    </TableCell>
                    <TableCell className="text-foreground/70 text-xs py-2 max-w-[200px]">
                      <div className="space-y-1">
                        {item.is_rental && (
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-primary block">Rental:</span>
                            {(() => {
                              const plans = Array.isArray(item.pricingPlans) ? (item.pricingPlans as any[]) : [];
                              if (plans.length === 0) return <span className="text-muted-foreground">—</span>;
                              const hourly = plans.find((p: any) => p.name?.toLowerCase() === 'hourly');
                              const daily = plans.find((p: any) => p.name?.toLowerCase() === 'daily');
                              const parts = [];
                              if (hourly) parts.push(`₹${Number(hourly.rate).toLocaleString('en-IN')}/hr`);
                              if (daily) parts.push(`₹${Number(daily.rate).toLocaleString('en-IN')}/day`);
                              return parts.length > 0 ? parts.join(' · ') : `₹${Number(plans[0].rate).toLocaleString('en-IN')} (${plans[0].name})`;
                            })()}
                          </div>
                        )}
                        {item.is_studio_space && (
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-amber-500 block">Studio:</span>
                            {(() => {
                              const plans = Array.isArray(item.studioPricingPlans) ? (item.studioPricingPlans as any[]) : [];
                              if (plans.length === 0) return <span className="text-muted-foreground">—</span>;
                              const hourly = plans.find((p: any) => p.name?.toLowerCase() === 'hourly');
                              const daily = plans.find((p: any) => p.name?.toLowerCase() === 'daily');
                              const parts = [];
                              if (hourly) parts.push(`₹${Number(hourly.rate).toLocaleString('en-IN')}/hr`);
                              if (daily) parts.push(`₹${Number(daily.rate).toLocaleString('en-IN')}/day`);
                              return parts.length > 0 ? parts.join(' · ') : `₹${Number(plans[0].rate).toLocaleString('en-IN')} (${plans[0].name})`;
                            })()}
                          </div>
                        )}
                        {!item.is_rental && !item.is_studio_space && (
                          <span className="text-muted-foreground italic font-medium">In-house</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <div className="inline-flex items-center gap-2">
                        <Link href={`/equipment/${item.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        {!isEmployee && (
                          <EditEquipmentDialog
                            equipment={{
                              id: item.id,
                              name: item.name,
                              serialNumber: item.serialNumber,
                              categoryId: (item as any).categoryId ?? null,
                              branchId: (item as any).branchId ?? null,
                              pricingPlans: Array.isArray(item.pricingPlans) ? (item.pricingPlans as any[]) : [],
                              studioPricingPlans: Array.isArray((item as any).studioPricingPlans) ? ((item as any).studioPricingPlans as any[]) : [],
                              image_url: item.image_url,
                              specs: Array.isArray((item as any).specs) ? ((item as any).specs as string[]) : typeof (item as any).specs === 'string' ? JSON.parse((item as any).specs) : [],
                              description: item.description ?? null,
                              is_studio_space: (item as any).is_studio_space,
                              is_rental: (item as any).is_rental,
                              purchase_date: (item as any).purchase_date,
                              warranty_duration_months: (item as any).warranty_duration_months,
                              warranty_expiration_date: (item as any).warranty_expiration_date,
                              service_cost: (item as any).service_cost,
                              repair_cost: (item as any).repair_cost,
                              purchase_bill: (item as any).purchase_bill,
                            }}
                            categories={categories}
                            branches={branches}
                          />
                        )}
                        {isSuperAdmin && (
                          <DeleteEquipmentButton
                            equipmentId={item.id}
                            equipmentName={item.name}
                          />
                        )}
                      </div>
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

export default async function EquipmentPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedSearchParams = await searchParams;
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
  const isSuperAdmin = profile?.role === 'SUPER_ADMIN' || profile?.role === 'DEVELOPER';

  const [categories, branches] = await Promise.all([
    getCategories().catch(() => []),
    getBranches().catch(() => []),
  ]);

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
        <EquipmentData 
          isEmployee={isEmployee} 
          isSuperAdmin={isSuperAdmin} 
          categories={categories} 
          branches={branches}
          searchParams={resolvedSearchParams as any}
        />
      </Suspense>
    </div>
  );
}
