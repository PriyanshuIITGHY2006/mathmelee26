// app/api/admin/bookings/[bookingId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const slotId = body?.slotId;

    if (!slotId || typeof slotId !== "string") {
      return NextResponse.json({ error: "Target slotId is required." }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      select: { id: true, name: true, slotId: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.slotId === slotId) {
      return NextResponse.json({ error: "Participant is already in this slot." }, { status: 400 });
    }

    const targetSlot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { _count: { select: { bookings: true } } },
    });

    if (!targetSlot) {
      return NextResponse.json({ error: "Target slot not found." }, { status: 404 });
    }

    if (targetSlot._count.bookings >= targetSlot.capacity) {
      return NextResponse.json({ error: "Target slot is full." }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id: params.bookingId },
      data: { slotId },
      select: { id: true, name: true, slotId: true },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("[Admin Booking PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to move participant." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      select: { id: true, name: true, email: true, slotId: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    await prisma.booking.delete({ where: { id: params.bookingId } });

    return NextResponse.json({
      success: true,
      removed: { name: booking.name, email: booking.email },
    });
  } catch (error) {
    console.error("[Admin Booking DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete booking." }, { status: 500 });
  }
}