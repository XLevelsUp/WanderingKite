import { auth } from '@/auth';
import { adminAuthClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'client') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { service } = body;

    if (!service) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const supabase = adminAuthClient;

    // Fetch client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', session.user.email as string)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'client_not_found' }, { status: 404 });
    }

    // Insert client services relation row
    const { error: insertError } = await supabase
      .from('client_services')
      .insert({
        client_id: client.id,
        type: service,
      });

    if (insertError) {
      console.error('Add service insert error:', insertError);
      return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/client/services/add error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
