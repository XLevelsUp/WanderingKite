import { adminAuthClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const email = 'admin@wanderingkite.com';
  const password = 'admin123';
  const fullName = 'Super Admin';

  try {
    // 1. Create User
    const { data: userData, error: createError } =
      await adminAuthClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!userData.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 500 }
      );
    }

    // 2. Update Role to SUPER_ADMIN
    // The trigger automatically makes them STAFF, so we override it.
    const { error: updateError } = await adminAuthClient
      .from('profiles')
      .update({ role: 'SUPER_ADMIN' })
      .eq('id', userData.user.id);

    if (updateError) {
      return NextResponse.json(
        {
          message: 'User created but role update failed',
          error: updateError.message,
          user: userData.user,
        },
        { status: 200 }
      ); // Return 200 as user exists now, but manual role update might be needed
    }

    return NextResponse.json({
      message: 'Super Admin created successfully',
      credentials: { email, password },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
