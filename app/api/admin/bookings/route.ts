// app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const slots = await prisma.slot.findMany({
      include: {
        bookings: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    const formattedSlots = slots.map((slot) => ({
      id: slot.id,
      date: format(slot.date, "yyyy-MM-dd"),
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      bookingCount: slot._count.bookings,
      meetingLink: slot.meetingLink,
      bookings: slot.bookings.map((b) => ({
        id: b.id,
        name: b.name,
        email: b.email,
        whatsapp: b.whatsapp,
        createdAt: b.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ slots: formattedSlots });
  } catch (error) {
    console.error("[Admin Bookings GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings." }, { status: 500 });
  }
}