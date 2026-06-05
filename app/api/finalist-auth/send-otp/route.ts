import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  const normalized = email.trim().toLowerCase();
  const finalist = await prisma.allowedFinalist.findUnique({ where: { email: normalized } });
  if (!finalist) {
    return NextResponse.json({ error: "This email is not on the finalists list." }, { status: 403 });
  }
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.finalistOtp.upsert({
    where: { email: normalized },
    update: { otp, expiresAt, createdAt: new Date() },
    create: { email: normalized, otp, expiresAt },
  });
  await sendOtpEmail(normalized, finalist.name, otp);
  return NextResponse.json({ ok: true });
}
