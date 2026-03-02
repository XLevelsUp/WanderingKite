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
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Core counts
  const [equipmentCount, clientsCount, activeRentalsCount] = await Promise.all([
    supabase.from('equipment').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase
      .from('rentals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE'),
  ]);

  // Enterprise stats — from assignment_history (added in migration 00004)
  // Wrapped in Promise.resolve() so .catch() chains correctly on the SupabaseBuilder type.
  const gearInUse = await Promise.resolve(
    supabase
      .from('assignment_history')
      .select('*', { count: 'exact', head: true })
      .is('returnedAt', null),
  )
    .then((r) => r.count ?? 0)
    .catch(() => 0);

  const overdueGear = await Promise.resolve(
    supabase
      .from('overdue_equipment')
      .select('*', { count: 'exact', head: true }),
  )
    .then((r) => r.count ?? 0)
    .catch(() => 0);

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
      subtitle: 'Out > 3 days, unretured',
      icon: AlertTriangle,
      href: '/dashboard/equipment',
      color: overdueGear > 0 ? 'text-red-600' : 'text-slate-500',
      bg: overdueGear > 0 ? 'bg-red-50' : 'bg-slate-50',
      badge: overdueGear > 0 ? 'Action required' : undefined,
    },
  ];

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-slate-500 mt-2'>
          Photo Studio ERP — Asset Management Overview
        </p>
      </div>

      {/* Stat Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
        {statCards.map((card) => (
          <Link key={card.title} href={card.href} className='block'>
            <Card className='hover:shadow-md transition-shadow cursor-pointer'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-slate-600'>
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
                <p className='text-xs text-slate-500 mt-1'>{card.subtitle}</p>
                {card.badge && (
                  <Badge variant='destructive' className='mt-2 text-xs'>
                    {card.badge}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to manage your studio assets
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold mb-1'>Add Equipment</h3>
              <p className='text-sm text-slate-600'>
                Register new gear into inventory.
              </p>
            </div>
            <Link href='/dashboard/equipment/new'>
              <Button size='sm' variant='secondary'>
                Add Equipment
              </Button>
            </Link>
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold mb-1'>Register Client</h3>
              <p className='text-sm text-slate-600'>
                Add a new client profile.
              </p>
            </div>
            <Link href='/dashboard/clients/new'>
              <Button size='sm' variant='secondary'>
                Add Client
              </Button>
            </Link>
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold mb-1'>Create Order</h3>
              <p className='text-sm text-slate-600'>
                Start a new rental order.
              </p>
            </div>
            <Link href='/dashboard/rentals'>
              <Button size='sm' variant='secondary'>
                View Rentals
              </Button>
            </Link>
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold mb-1'>Add Employee</h3>
              <p className='text-sm text-slate-600'>
                Onboard a new team member.
              </p>
            </div>
            <Link href='/dashboard/employees/new'>
              <Button size='sm' variant='secondary'>
                Add Employee
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
