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
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { hasAccess } from '@/lib/access';
import { Badge } from '@/components/ui/badge';
import { Calendar, UserCheck, Activity } from 'lucide-react';
import { logger } from '@/lib/logger';

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isSuperAdmin = profile?.role === 'SUPER_ADMIN';

  if (!hasAccess(profile?.role ?? 'EMPLOYEE', '/dashboard/clients')) {
    redirect('/dashboard');
  }

  // Fetch client details with bookings count and recent activity dates via Supabase Server Client
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*, client_services(type), photography_bookings(status, date_time, created_at), rental_bookings(status, start_date, created_at), studio_bookings(status, date_time, created_at)')
    .order('createdAt', { ascending: false });

  if (error) {
    logger.error('Error loading clients in ERP:', error);
  }

  const clientsWithActivity = (clients || []).map((client: any) => {
    const dates = [new Date(client.createdAt)];
    if (client.photography_bookings && client.photography_bookings[0]) {
      dates.push(new Date(client.photography_bookings[0].date_time));
      dates.push(new Date(client.photography_bookings[0].created_at));
    }
    if (client.rental_bookings && client.rental_bookings[0]) {
      dates.push(new Date(client.rental_bookings[0].start_date));
      dates.push(new Date(client.rental_bookings[0].created_at));
    }
    if (client.studio_bookings && client.studio_bookings[0]) {
      dates.push(new Date(client.studio_bookings[0].date_time));
      dates.push(new Date(client.studio_bookings[0].created_at));
    }
    const lastActive = new Date(Math.max(...dates.map((d) => d.getTime())));
    const bookingRequests =
      (client.photography_bookings?.filter((b: any) => b.status === 'PENDING').length || 0) +
      (client.rental_bookings?.filter((b: any) => b.status === 'PENDING').length || 0) +
      (client.studio_bookings?.filter((b: any) => b.status === 'PENDING').length || 0);

    const confirmedBookings =
      (client.photography_bookings?.filter((b: any) => b.status !== 'PENDING' && b.status !== 'CANCELLED').length || 0) +
      (client.rental_bookings?.filter((b: any) => b.status !== 'PENDING' && b.status !== 'CANCELLED').length || 0) +
      (client.studio_bookings?.filter((b: any) => b.status !== 'PENDING' && b.status !== 'CANCELLED').length || 0);

    return {
      ...client,
      lastActive,
      bookingRequests,
      confirmedBookings,
    };
  });

  return (
    <div className="space-y-8 text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients (ERP)</h1>
          <p className="text-slate-400 mt-2">Manage customer records, view activity, and verify ID submissions.</p>
        </div>
        {isSuperAdmin && (
          <Link href="/dashboard/clients/new">
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg">
              Add Client
            </Button>
          </Link>
        )}
      </div>

      <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">Registered Clients</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            {clientsWithActivity.length} client profiles tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="hover:bg-transparent border-slate-850">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Contact</TableHead>
                <TableHead className="text-slate-400">Subscribed Services</TableHead>
                <TableHead className="text-slate-400">Booking Requests</TableHead>
                <TableHead className="text-slate-400">Confirmed Bookings</TableHead>
                <TableHead className="text-slate-400">Last Active</TableHead>
                <TableHead className="text-slate-400">Account Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientsWithActivity.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-slate-500 py-8 italic border-transparent"
                  >
                    No client profiles found.
                  </TableCell>
                </TableRow>
              ) : (
                clientsWithActivity.map((client: any) => {
                  const clientName =
                    client.name ||
                    `${client.first_name || ''} ${client.last_name || ''}`.trim() ||
                    'Unnamed';
                  return (
                    <TableRow key={client.id} className="border-slate-850 hover:bg-slate-800/20 transition-colors">
                      <TableCell className="font-semibold text-white">{clientName}</TableCell>
                      <TableCell className="text-slate-300">
                        <div className="text-xs space-y-0.5">
                          <div>{client.email}</div>
                          {client.phone && <div className="text-slate-400">{client.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.client_services && client.client_services.length > 0 ? (
                            client.client_services.map((svc: any) => (
                              <Badge
                                key={svc.type}
                                variant="outline"
                                className="text-[10px] uppercase border-slate-700 bg-slate-900/60 text-slate-300 px-2 py-0.5 rounded"
                              >
                                {svc.type.replace('_', ' ')}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-slate-500 text-xs italic">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-200">
                        {client.bookingRequests > 0 ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold animate-pulse">
                            {client.bookingRequests} requests
                          </Badge>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-200">
                        {client.confirmedBookings > 0 ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            {client.confirmedBookings} confirmed
                          </Badge>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Activity className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span>{client.lastActive.toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.is_active ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-medium">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-xs font-medium">
                            Deactivated
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/clients/${client.id}`}>
                          <Button variant="outline" size="sm" className="border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-white rounded-lg">
                            View Profile
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
