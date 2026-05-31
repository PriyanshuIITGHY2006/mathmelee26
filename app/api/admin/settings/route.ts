import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRegistrationsOpen, setRegistrationsOpen } from "@/lib/settings";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const open = await getRegistrationsOpen();
  return NextResponse.json({ registrationsOpen: open });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { registrationsOpen } = await req.json();
  await setRegistrationsOpen(Boolean(registrationsOpen));
  return NextResponse.json({ registrationsOpen: Boolean(registrationsOpen) });
}
