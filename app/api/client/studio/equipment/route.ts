import { auth } from '@/auth';
import { adminAuthClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'client') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const supabase = adminAuthClient;

    const { data: equipment, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('available_for_studio', true)
      .neq('status', 'RETIRED')
      .order('name', { ascending: true });

    if (error) {
      console.error('Fetch studio equipment failed:', error);
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }

    return NextResponse.json({ equipment });
  } catch (error) {
    console.error('GET /api/client/studio/equipment error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
