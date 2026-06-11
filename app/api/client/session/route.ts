import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, user: session.user });
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
