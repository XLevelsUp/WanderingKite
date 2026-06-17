import { auth } from '@/auth';
import { adminAuthClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

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
      .eq('available_for_rental', true)
      .neq('status', 'RETIRED')
      .order('name', { ascending: true });

    if (error) {
      logger.error('Fetch rental equipment failed:', error);
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }

    return NextResponse.json({ equipment });
  } catch (error) {
    logger.error('GET /api/client/rentals/equipment error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
