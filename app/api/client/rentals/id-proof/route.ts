import { auth } from '@/auth';
import { adminAuthClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'client') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const idType = formData.get('idType') as string;

    if (!file || !idType) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    // Size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({
        error: 'file_too_large',
        message: "We couldn't upload your file. Please check the file size and try again (max 10MB).",
      }, { status: 400 });
    }

    // Supported formats: images and PDFs
    const SUPPORTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!SUPPORTED.includes(file.type)) {
      return NextResponse.json({
        error: 'invalid_format',
        message: 'Only PDF, JPG, PNG or WebP files are supported.',
      }, { status: 400 });
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() ?? 'pdf';
    const timestamp = Date.now();
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
      .slice(0, 40);
    const filePath = `client_${client.id}/${safeName}-${timestamp}.${ext}`;

    const { error: uploadError } = await adminAuthClient.storage
      .from('id-proofs')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('ID proof upload storage error:', uploadError);
      return NextResponse.json({
        error: 'upload_failed',
        message: "We couldn't upload your file to storage. Please try again.",
      }, { status: 500 });
    }

    // Check if ID proof already exists for database upsert
    const { data: existingIdProof, error: checkError } = await supabase
      .from('client_id_proofs')
      .select('id')
      .eq('client_id', client.id)
      .maybeSingle();

    if (checkError) {
      console.error('Check ID proof error:', checkError);
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }

    let queryError;
    if (existingIdProof) {
      const { error } = await supabase
        .from('client_id_proofs')
        .update({
          id_type: idType,
          file_url: filePath,
          status: 'PENDING',
          reject_reason: null, // Clear past rejection reasons
          updated_at: new Date().toISOString(),
        })
        .eq('client_id', client.id);
      queryError = error;
    } else {
      const { error } = await supabase
        .from('client_id_proofs')
        .insert({
          client_id: client.id,
          id_type: idType,
          file_url: filePath,
          status: 'PENDING',
        });
      queryError = error;
    }

    if (queryError) {
      console.error('Save ID proof database error:', queryError);
      return NextResponse.json({
        error: 'database_failed',
        message: 'Failed to register your uploaded document in our database.',
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/client/rentals/id-proof error:', error);
    return NextResponse.json({
      error: 'server_error',
      message: 'Something went wrong on our end. Please try again in a moment.',
    }, { status: 500 });
  }
}
