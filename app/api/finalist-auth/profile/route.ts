import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getFinalistSession } from "@/lib/finalist-session";

export async function PATCH(req: NextRequest) {
  const email = await getFinalistSession();
  if (!email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { codeforcesId } = await req.json();
  if (!codeforcesId || typeof codeforcesId !== "string") {
    return NextResponse.json({ error: "Codeforces ID required" }, { status: 400 });
  }
  const profile = await prisma.finalistProfile.upsert({
    where: { email },
    update: { codeforcesId: codeforcesId.trim() },
    create: { email, codeforcesId: codeforcesId.trim() },
  });
  return NextResponse.json({ ok: true, profile });
}
