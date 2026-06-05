import { NextResponse } from "next/server";
import { clearFinalistSession } from "@/lib/finalist-session";

export async function POST() {
  await clearFinalistSession();
  return NextResponse.json({ ok: true });
}
