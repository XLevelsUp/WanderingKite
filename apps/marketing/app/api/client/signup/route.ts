import { NextResponse } from "next/server";
import { adminAuthClient } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      address,
      email,
      gender,
      password,
      services,
    } = body;

    // Validate email presence
    if (!email) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    // 1. Check if email already exists
    const { data: existingClient, error: checkError } = await adminAuthClient
      .from("clients")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingClient) {
      return NextResponse.json({ error: "duplicate_email" }, { status: 409 });
    }

    // 2. Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insert new client record
    const { data: client, error: insertError } = await adminAuthClient
      .from("clients")
      .insert({
        name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        phone: phoneNumber,
        address: address,
        email: email,
        gender: gender,
        password_hash: passwordHash,
        is_active: true,
        // Self-signups came through the site by definition — the visitor is
        // never asked. source is NOT NULL, so this must be set explicitly.
        source: 'WEBSITE',
      })
      .select("id")
      .single();

    if (insertError || !client) {
      logger.error("Client signup insert error:", insertError);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }

    // 4. Insert client services relationships
    if (services && Array.isArray(services) && services.length > 0) {
      const serviceInserts = services.map((svc: string) => ({
        client_id: client.id,
        type: svc,
      }));

      const { error: servicesError } = await adminAuthClient
        .from("client_services")
        .insert(serviceInserts);

      if (servicesError) {
        logger.error("Client signup services insert error:", servicesError);
        // We still keep the client profile even if service mapping had issues,
        // but let's log it.
      }
    }

    return NextResponse.json({ success: true, clientId: client.id });
  } catch (error) {
    logger.error("Client signup unexpected error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
