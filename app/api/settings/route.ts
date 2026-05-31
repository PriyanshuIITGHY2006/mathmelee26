import { NextResponse } from "next/server";
import { getRegistrationsOpen } from "@/lib/settings";

export async function GET() {
  const open = await getRegistrationsOpen();
  return NextResponse.json({ registrationsOpen: open });
}
