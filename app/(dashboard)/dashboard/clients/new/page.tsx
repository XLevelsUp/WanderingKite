import { NewClientForm } from './NewClientForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function NewClientPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'SUPER_ADMIN' && profile?.role !== 'DEVELOPER') redirect('/dashboard/clients');
  return (
    <div className="space-y-6">
      <Link href="/dashboard/clients">
        <Button variant="ghost" size="sm" className="gap-2 text-foreground/50 hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Button>
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Client</h1>
        <p className="text-slate-500 mt-2">
          Register a new client in the system
        </p>
      </div>

      <NewClientForm />
    </div>
  );
}
