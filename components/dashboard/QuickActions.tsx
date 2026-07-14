import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Action {
  title: string;
  description: string;
  href: string;
  cta: string;
  superAdminOnly?: boolean;
}

const ACTIONS: Action[] = [
  {
    title: 'Add Equipment',
    description: 'Register new gear into inventory.',
    href: '/dashboard/equipment/new',
    cta: 'Add Equipment',
  },
  {
    title: 'Register Client',
    description: 'Add a new client profile.',
    href: '/dashboard/clients/new',
    cta: 'Add Client',
    superAdminOnly: true,
  },
  {
    title: 'Add Employee',
    description: 'Onboard a new team member.',
    href: '/dashboard/employees/new',
    cta: 'Add Employee',
  },
];

/** Quick Actions card — rows stack on mobile, sit side-by-side from sm up. */
export function QuickActions({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const actions = ACTIONS.filter((a) => !a.superAdminOnly || isSuperAdmin);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks to manage your studio assets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action) => (
          <div
            key={action.title}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <h3 className="font-semibold mb-1">{action.title}</h3>
              <p className="text-sm text-slate-600">{action.description}</p>
            </div>
            <Link href={action.href} className="w-full sm:w-auto shrink-0">
              <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                {action.cta}
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
