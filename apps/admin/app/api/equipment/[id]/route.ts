import { NextRequest, NextResponse } from 'next/server';
import { adminAuthClient } from '@/lib/supabase/admin';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Perform a soft delete as established in the project pattern
    const { error } = await adminAuthClient
      .from('equipment')
      .update({ deletedAt: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
