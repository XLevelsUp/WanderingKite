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
    const { data: client, error } = await supabase
      .from('clients')
      .select('*, client_services(type), client_id_proofs(*)')
      .eq('email', session.user.email as string)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'client_not_found' }, { status: 404 });
    }

    const services = client.client_services?.map((s: any) => s.type) || [];
    
    const idProofObj = Array.isArray(client.client_id_proofs) 
      ? client.client_id_proofs[0] 
      : client.client_id_proofs;

    return NextResponse.json({
      profile: {
        id: client.id,
        name: client.name,
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        dateOfBirth: client.date_of_birth,
        gender: client.gender,
        isActive: client.is_active,
      },
      services,
      idProof: idProofObj
        ? {
            id: idProofObj.id,
            idType: idProofObj.id_type,
            fileUrl: idProofObj.file_url,
            status: idProofObj.status,
            rejectReason: idProofObj.reject_reason,
          }
        : null,
    });
  } catch (error) {
    logger.error('GET /api/client/dashboard error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
