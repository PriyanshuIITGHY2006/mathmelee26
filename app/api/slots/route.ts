// app/api/slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// ─── GET /api/slots — Public: List slots (optionally filtered by date) ───────
export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date");
  
  const whereClause = dateParam ? { date: new Date(dateParam) } : {};

  const slots = await prisma.slot.findMany({
    where: whereClause,
    include: { _count: { select: { bookings: true } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const formattedSlots = slots.map(slot => ({
    id: slot.id,
    date: slot.date.toISOString().split("T")[0],
    startTime: slot.startTime,
    endTime: slot.endTime,
    capacity: slot.capacity,
    bookingCount: slot._count.bookings,
    meetingLink: slot.meetingLink,
  }));

  return NextResponse.json({ slots: formattedSlots });
}

// ─── POST /api/slots — Admin only: Create a new slot ─────────────────────────
const CreateSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  meetingLink: z.string().url().optional().or(z.literal("")),
  capacity: z.number().int().min(1).max(20),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = CreateSlotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { date, startTime, endTime, meetingLink, capacity } = parsed.data;

  const slot = await prisma.slot.create({
    data: {
      date: new Date(date),
      startTime,
      endTime,
      meetingLink: meetingLink || null,
      capacity,
    },
  });

  return NextResponse.json({ success: true, slot }, { status: 201 });
}