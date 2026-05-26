// app/api/slots/[slotId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { z } from "zod";

// ─── GET /api/slots/:slotId — Public: returns a single slot ──────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { slotId: string } }
) {
  const slot = await prisma.slot.findUnique({
    where: { id: params.slotId },
    include: { _count: { select: { bookings: true } } },
  });

  if (!slot) {
    return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  }

  return NextResponse.json({
    slot: {
      id: slot.id,
      date: format(slot.date, "yyyy-MM-dd"),
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      bookingCount: slot._count.bookings,
      meetingLink: slot.meetingLink,
    },
  });
}

// ─── PATCH /api/slots/:slotId — Admin only: Edit a slot ──────────────────────
const EditSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  capacity: z.number().int().min(1).max(20).optional(),
  delayMinutes: z.number().int().min(1).max(300).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slotId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const slot = await prisma.slot.findUnique({ where: { id: params.slotId } });
  if (!slot) {
    return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = EditSlotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { date, startTime, endTime, meetingLink, capacity, delayMinutes } = parsed.data;

  let newStartTime = startTime ?? slot.startTime;
  let newEndTime = endTime ?? slot.endTime;

  if (delayMinutes) {
    newStartTime = addMinutesToTime(slot.startTime, delayMinutes);
    newEndTime = addMinutesToTime(slot.endTime, delayMinutes);
  }

  const updated = await prisma.slot.update({
    where: { id: params.slotId },
    data: {
      ...(date && { date: new Date(date) }),
      startTime: newStartTime,
      endTime: newEndTime,
      ...(meetingLink !== undefined && { meetingLink: meetingLink || null }),
      ...(capacity && { capacity }),
    },
  });

  return NextResponse.json({
    slot: {
      id: updated.id,
      date: format(updated.date, "yyyy-MM-dd"),
      startTime: updated.startTime,
      endTime: updated.endTime,
      capacity: updated.capacity,
      meetingLink: updated.meetingLink,
    },
    delayApplied: delayMinutes ?? null,
  });
}

// ─── DELETE /api/slots/:slotId — Admin only ──────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slotId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const slot = await prisma.slot.findUnique({
    where: { id: params.slotId },
    include: { _count: { select: { bookings: true } } },
  });

  if (!slot) {
    return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  }

  // Delete bookings first (cascade), then the slot
  await prisma.$transaction([
    prisma.booking.deleteMany({ where: { slotId: params.slotId } }),
    prisma.slot.delete({ where: { id: params.slotId } }),
  ]);

  return NextResponse.json({
    success: true,
    deletedBookings: slot._count.bookings,
  });
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}