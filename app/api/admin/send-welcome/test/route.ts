import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const f = await prisma.allowedFinalist.findUnique({ where: { email: "priyanshuib01@gmail.com" } });
  if (!f) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await sendWelcomeEmail(f.email, f.name, f.college);
  return NextResponse.json({ ok: true });
}
