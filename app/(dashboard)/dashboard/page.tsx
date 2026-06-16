import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Package,
  Users,
  ClipboardList,
  Activity,
  AlertTriangle,
  LayoutDashboard,
} from 'lucide-react';
import { EmployeeDashboard } from './EmployeeDashboard';
import { AdminOperationalHub } from '@/components/dashboard/AdminOperationalHub';
import { getStudioBookingConflicts } from '@/actions/audit';

export const metadata: Metadata = {
  title: 'Overview — Studio ERP',
  description: 'Photo Studio ERP dashboard — asset management overview for equipment, clients, and rentals.',
};

// Helper to extract quotation / paymentStatus from booking notes field
function parseBookingMeta(notes: string | null): { quotation: number; paymentStatus: 'PENDING' | 'PARTIALLY_COMPLETED' | 'COMPLETED' } {
  const defaults = { quotation: 0, paymentStatus: 'PENDING' as const };
  if (!notes) return defaults;
  try {
    const marker = '---METADATA---';
    const idx = notes.indexOf(marker);
    if (idx === -1) return defaults;
    const meta = JSON.parse(notes.slice(idx + marker.length).trim());
    return {
      quotation: Number(meta.quotationAmount ?? 0),
      paymentStatus: (meta.paymentStatus as any) ?? 'PENDING',
    };
  } catch {
    return defaults;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from('profiles').select('role, fullName').eq('id', user.id).single();
  const isEmployee = profile?.role === 'EMPLOYEE';
  const isSuperAdmin = profile?.role === 'SUPER_ADMIN';

  if (isEmployee) {
    return <EmployeeDashboard user={user} profile={profile} />;
  }

  // ─── Core counts ───────────────────────────────────────────────────────────
  const [equipmentCount, clientsCount, activeRentalsCount] = await Promise.all([
    supabase.from('equipment').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('status', 'CONFIRMED'),
  ]);

  const gearInUse = await Promise.resolve(
    supabase.from('assignment_history').select('*', { count: 'exact', head: true }).is('returnedAt', null)
  ).then((r) => r.count ?? 0).catch(() => 0);

  const overdueGear = await Promise.resolve(
    supabase.from('overdue_equipment').select('*', { count: 'exact', head: true })
  ).then((r) => r.count ?? 0).catch(() => 0);

  // ─── Operational data for the hub ─────────────────────────────────────────
  const [
    photoPendingRes, photoConfirmedRes, photoCompletedRes,
    studioPendingRes, studioConfirmedRes, studioCompletedRes,
    rentalPendingRes, rentalConfirmedRes,
    idProofsRes,
    clientsRes,
  ] = await Promise.all([
    supabase.from('photography_bookings').select('id, client_id, status, date_time, notes, amount_paid, advance_paid, created_at, updated_at').eq('status', 'PENDING'),
    supabase.from('photography_bookings').select('id, client_id, status, date_time, notes, amount_paid, advance_paid, created_at, updated_at').eq('status', 'CONFIRMED'),
    supabase.from('photography_bookings').select('id, client_id, status, date_time, notes, amount_paid, advance_paid, created_at, updated_at').eq('status', 'COMPLETED'),
    supabase.from('studio_bookings').select('id, client_id, status, date_time, notes, amount_paid, created_at, updated_at').eq('status', 'PENDING'),
    supabase.from('studio_bookings').select('id, client_id, status, date_time, notes, amount_paid, created_at, updated_at').eq('status', 'CONFIRMED'),
    supabase.from('studio_bookings').select('id, client_id, status, date_time, notes, amount_paid, created_at, updated_at').eq('status', 'COMPLETED'),
    supabase.from('rental_bookings').select('id, client_id, status, start_date, created_at, updated_at').eq('status', 'PENDING'),
    supabase.from('rental_bookings').select('id, client_id, status, start_date, created_at, updated_at').eq('status', 'CONFIRMED'),
    supabase.from('client_id_proofs').select('client_id, id_type, status, file_url'),
    supabase.from('clients').select('id, name'),
  ]);

  // Build a client name lookup
  const clientMap: Record<string, string> = {};
  (clientsRes.data ?? []).forEach((c: any) => { clientMap[c.id] = c.name; });

  type BookingType = 'PHOTOGRAPHY' | 'STUDIO' | 'RENTAL';
  type PaymentStatus = 'PENDING' | 'PARTIALLY_COMPLETED' | 'COMPLETED';
  type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

  function mapBooking(b: any, type: BookingType): any {
    const dateField = type === 'RENTAL' ? b.start_date : b.date_time;
    const { quotation, paymentStatus } = parseBookingMeta(b.notes);
    return {
      id: b.id,
      clientId: b.client_id,
      clientName: clientMap[b.client_id] || 'Unknown Client',
      status: b.status as BookingStatus,
      dateTime: dateField,
      type,
      quotation,
      amountPaid: Number(b.amount_paid ?? 0),
      paymentStatus: paymentStatus as PaymentStatus,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    };
  }

  const pendingBookings = [
    ...(photoPendingRes.data ?? []).map((b) => mapBooking(b, 'PHOTOGRAPHY')),
    ...(studioPendingRes.data ?? []).map((b) => mapBooking(b, 'STUDIO')),
    ...(rentalPendingRes.data ?? []).map((b) => mapBooking(b, 'RENTAL')),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const confirmedBookings = [
    ...(photoConfirmedRes.data ?? []).map((b) => mapBooking(b, 'PHOTOGRAPHY')),
    ...(studioConfirmedRes.data ?? []).map((b) => mapBooking(b, 'STUDIO')),
    ...(rentalConfirmedRes.data ?? []).map((b) => mapBooking(b, 'RENTAL')),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const idProofs = (idProofsRes.data ?? []).map((p: any) => ({
    clientId: p.client_id,
    clientName: clientMap[p.client_id] || 'Unknown Client',
    idType: p.id_type,
    status: p.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    fileUrl: p.file_url,
  }));

  // Outstanding balances = any booking (CONFIRMED or COMPLETED) where payment is not fully settled
  // This is the key fix: COMPLETED bookings where the client hasn't settled the balance yet
  // are now included alongside CONFIRMED partial/pending payment bookings.
  const outstandingBookings = [
    ...confirmedBookings.filter((b) => b.paymentStatus !== 'COMPLETED'),
    ...(photoCompletedRes.data ?? [])
      .map((b: any) => mapBooking(b, 'PHOTOGRAPHY'))
      .filter((b: any) => b.paymentStatus !== 'COMPLETED'),
    ...(studioCompletedRes.data ?? [])
      .map((b: any) => mapBooking(b, 'STUDIO'))
      .filter((b: any) => b.paymentStatus !== 'COMPLETED'),
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // ─── Phase 2 Widget Calculations ──────────────────────────────────────────
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday as start of week
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let todaysBookingsCount = 0;

  const allBookings = [
    ...(photoPendingRes.data ?? []).map((b) => mapBooking(b, 'PHOTOGRAPHY')),
    ...(photoConfirmedRes.data ?? []).map((b) => mapBooking(b, 'PHOTOGRAPHY')),
    ...(photoCompletedRes.data ?? []).map((b) => mapBooking(b, 'PHOTOGRAPHY')),
    ...(studioPendingRes.data ?? []).map((b) => mapBooking(b, 'STUDIO')),
    ...(studioConfirmedRes.data ?? []).map((b) => mapBooking(b, 'STUDIO')),
    ...(studioCompletedRes.data ?? []).map((b) => mapBooking(b, 'STUDIO')),
    ...(rentalPendingRes.data ?? []).map((b) => mapBooking(b, 'RENTAL')),
    ...(rentalConfirmedRes.data ?? []).map((b) => mapBooking(b, 'RENTAL')),
  ];

  allBookings.forEach((b) => {
    const d = new Date(b.dateTime);
    if (d >= startOfDay && d < new Date(startOfDay.getTime() + 86400000)) {
      todaysBookingsCount++;
    }
  });

  const recentActivity = [...allBookings]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // ─── Stat cards ────────────────────────────────────────────────────────────
  const statCards = [
    {
      title: 'Total Equipment',
      value: equipmentCount.count ?? 0,
      subtitle: 'Items in inventory',
      icon: Package,
      href: '/dashboard/equipment',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Clients',
      value: clientsCount.count ?? 0,
      subtitle: 'Registered clients',
      icon: Users,
      href: '/dashboard/clients',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Active Rentals',
      value: activeRentalsCount.count ?? 0,
      subtitle: 'Currently rented out',
      icon: ClipboardList,
      href: '/dashboard/rentals',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Gear In Use',
      value: gearInUse,
      subtitle: 'Active assignments',
      icon: Activity,
      href: '/dashboard/equipment',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Overdue Returns',
      value: overdueGear,
      subtitle: 'Out > 3 days, unreturned',
      icon: AlertTriangle,
      href: '/dashboard/equipment',
      color: overdueGear > 0 ? 'text-red-600' : 'text-slate-500',
      bg: overdueGear > 0 ? 'bg-red-50' : 'bg-slate-50',
      badge: overdueGear > 0 ? 'Action required' : undefined,
    },
  ];

  const filteredStatCards = statCards.filter((card) => {
    if (card.href === '/dashboard/clients') return isSuperAdmin;
    return true;
  });

  const conflictLogs = isSuperAdmin ? await getStudioBookingConflicts() : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-2">
          Photo Studio ERP — Asset Management Overview
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {filteredStatCards.map((card) => (
          <Link key={card.title} href={card.href} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {card.title}
                </CardTitle>
                <span className={`p-1.5 rounded-md ${card.bg}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </span>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </div>
                <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
                {card.badge && (
                  <Badge variant="destructive" className="mt-2 text-xs">
                    {card.badge}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Operational Hub — Super Admin only */}
      {isSuperAdmin && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Operational Hub</h2>
          </div>
          <AdminOperationalHub
            allBookings={allBookings}
            pendingBookings={pendingBookings}
            confirmedBookings={confirmedBookings}
            outstandingBookings={outstandingBookings}
            idProofs={idProofs}
            conflictLogs={conflictLogs}
            todaysBookingsCount={todaysBookingsCount}
            recentActivity={recentActivity}
          />
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to manage your studio assets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Add Equipment</h3>
              <p className="text-sm text-slate-600">
                Register new gear into inventory.
              </p>
            </div>
            <Link href="/dashboard/equipment/new">
              <Button size="sm" variant="secondary">
                Add Equipment
              </Button>
            </Link>
          </div>
          {isSuperAdmin && (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Register Client</h3>
                <p className="text-sm text-slate-600">
                  Add a new client profile.
                </p>
              </div>
              <Link href="/dashboard/clients/new">
                <Button size="sm" variant="secondary">
                  Add Client
                </Button>
              </Link>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Create Order</h3>
              <p className="text-sm text-slate-600">
                Start a new rental order.
              </p>
            </div>
            <Link href="/dashboard/rentals">
              <Button size="sm" variant="secondary">
                View Rentals
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Add Employee</h3>
              <p className="text-sm text-slate-600">
                Onboard a new team member.
              </p>
            </div>
            <Link href="/dashboard/employees/new">
              <Button size="sm" variant="secondary">
                Add Employee
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
