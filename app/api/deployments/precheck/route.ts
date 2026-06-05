import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { startDate, endDate, equipmentIds } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for any active assignment overlapping the requested date range
    // Overlap condition: start1 < end2 AND start2 < end1
    const { data: conflicts, error } = await supabase
      .from('equipment_assignments')
      .select('equipmentId, equipment(name), assignedAt, expectedReturn')
      .in('equipmentId', equipmentIds)
      .is('returnedAt', null)
      .lt('assignedAt', endDate)
      .gt('expectedReturn', startDate);

    if (error) {
      console.error('[Precheck API] Database Error:', error.message);
      return NextResponse.json({ error: 'Database check failed' }, { status: 500 });
    }

    // Filter out null expectedReturn which implies 'infinity' in Postgres logic.
    // The above query handles expectedReturn > startDate, but if expectedReturn is null,
    // we need an OR condition or we handle it here in JS if Supabase GT doesn't handle null.
    // Let's refine the query using an OR to handle open-ended assignments.
    let query = supabase
      .from('equipment_assignments')
      .select('equipmentId, equipment(name), assignedAt, expectedReturn')
      .is('returnedAt', null)
      .lt('assignedAt', endDate)
      .or(`expectedReturn.gt.${startDate},expectedReturn.is.null`);

    if (equipmentIds && equipmentIds.length > 0) {
      query = query.in('equipmentId', equipmentIds);
    }

    const { data: strictConflicts, error: strictError } = await query;

    if (strictError) {
      console.error('[Precheck API] Strict DB Error:', strictError.message);
      return NextResponse.json({ error: 'Database check failed' }, { status: 500 });
    }

    if (strictConflicts && strictConflicts.length > 0) {
      return NextResponse.json({
        available: false,
        conflicts: strictConflicts,
      });
    }

    return NextResponse.json({ available: true, conflicts: [] });
  } catch (error: any) {
    console.error('[Precheck API] Unexpected Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
