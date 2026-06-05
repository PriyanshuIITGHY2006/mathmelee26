import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getFinalistSession } from "@/lib/finalist-session";

export async function GET() {
  const email = await getFinalistSession();
  if (!email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const [finalist, profile] = await Promise.all([
    prisma.allowedFinalist.findUnique({ where: { email } }),
    prisma.finalistProfile.findUnique({ where: { email } }),
  ]);
  if (!finalist) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ email, name: finalist.name, college: finalist.college, whatsapp: finalist.whatsapp, codeforcesId: profile?.codeforcesId ?? null });
}
