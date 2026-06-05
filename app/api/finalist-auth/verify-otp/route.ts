import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setFinalistSession } from "@/lib/finalist-session";

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const normalized = email.trim().toLowerCase();
  const record = await prisma.finalistOtp.findUnique({ where: { email: normalized } });
  if (!record) return NextResponse.json({ error: "No OTP found. Request a new one." }, { status: 400 });
  if (new Date() > record.expiresAt) {
    return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 });
  }
  if (record.otp !== otp.trim()) {
    return NextResponse.json({ error: "Incorrect OTP." }, { status: 400 });
  }
  await prisma.finalistOtp.delete({ where: { email: normalized } });
  await setFinalistSession(normalized);
  const profile = await prisma.finalistProfile.findUnique({ where: { email: normalized } });
  return NextResponse.json({ ok: true, hasProfile: !!profile?.codeforcesId });
}
