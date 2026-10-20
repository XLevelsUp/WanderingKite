import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Wallet, Package, Clock, ArrowRight } from 'lucide-react';
import { getOwnAttendance } from '@/actions/hr/attendance';

export async function EmployeeDashboard({ user, profile }: { user: any, profile: any }) {
  const supabase = await createClient();

  // 1. Fetch own upcoming/active deployments
  const { data: myDeployments } = await supabase
    .from('equipment_assignments')
    .select('*, equipment(name, serialNumber, image_url), client:clientId(name)')
    .eq('employeeId', user.id)
    .is('returnedAt', null)
    .order('"assignedAt"', { ascending: false });

  // 2. Fetch current month attendance
  const now = new Date();
  const logs = await getOwnAttendance(now.getMonth() + 1, now.getFullYear());
  const present = logs.filter(l => l.status === 'PRESENT').length;
  const late = logs.filter(l => l.status === 'LATE').length;
  const absent = logs.filter(l => l.status === 'ABSENT').length;
  const leaves = logs.filter(l => l.status === 'ON_LEAVE').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile.fullName?.split(' ')[0] || 'Team Member'}!</h1>
        <p className="text-foreground/50 mt-2">
          Here's a quick overview of your current assignments and attendance.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/attendance" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-emerald-500/5 border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-500">Present Days</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{present}</div>
              <p className="text-xs text-emerald-500/70 mt-1">This month</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/attendance" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-amber-500/5 border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-500">Late Days</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{late}</div>
              <p className="text-xs text-amber-500/70 mt-1">This month</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/attendance" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-red-500/5 border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-500">Absent / LOP</CardTitle>
              <Calendar className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{absent}</div>
              <p className="text-xs text-red-500/70 mt-1">This month</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/payslips" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Payslips</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary flex items-center justify-between">
                View
                <ArrowRight className="h-4 w-4 opacity-50" />
              </div>
              <p className="text-xs text-primary/70 mt-1">Download salary slips</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              My Active Equipment
            </CardTitle>
            <CardDescription>Gear currently assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {myDeployments && myDeployments.length > 0 ? (
              <div className="space-y-4">
                {myDeployments.map((assignment: any) => (
                  <div key={assignment.id} className="flex items-start justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-sm">{assignment.equipment?.name}</p>
                      <p className="text-xs text-foreground/50 font-mono mt-0.5">{assignment.equipment?.serialNumber}</p>
                      {assignment.client && (
                        <p className="text-xs text-foreground/40 mt-1">Client: {assignment.client.name}</p>
                      )}
                    </div>
                    <Badge variant={
                      assignment.expectedReturn && new Date(assignment.expectedReturn).getTime() < Date.now()
                        ? "destructive"
                        : "outline"
                    }>
                      {assignment.expectedReturn && new Date(assignment.expectedReturn).getTime() < Date.now()
                        ? "Overdue"
                        : "In Field"
                      }
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-foreground/50">You have no active equipment assignments.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Easily access your operational tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/fieldops" className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-white/5 transition-colors">
              <div>
                <p className="font-semibold text-sm">Field Operations</p>
                <p className="text-xs text-foreground/50">View all deployments and Quick Return</p>
              </div>
              <ArrowRight className="h-4 w-4 text-foreground/30" />
            </Link>
            <Link href="/attendance" className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-white/5 transition-colors">
              <div>
                <p className="font-semibold text-sm">My Attendance</p>
                <p className="text-xs text-foreground/50">Check your clock-ins and leaves</p>
              </div>
              <ArrowRight className="h-4 w-4 text-foreground/30" />
            </Link>
            <Link href="/payslips" className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-white/5 transition-colors">
              <div>
                <p className="font-semibold text-sm">My Payslips</p>
                <p className="text-xs text-foreground/50">Download your monthly salary slips</p>
              </div>
              <ArrowRight className="h-4 w-4 text-foreground/30" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
