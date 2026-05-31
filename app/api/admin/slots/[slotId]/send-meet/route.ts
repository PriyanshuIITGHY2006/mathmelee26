import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { sendMeetLinkEmail } from "@/lib/email";

export async function POST(
  _req: NextRequest,
  { params }: { params: { slotId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const slot = await prisma.slot.findUnique({
    where: { id: params.slotId },
    include: { bookings: true },
  });

  if (!slot) return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  if (!slot.meetingLink) return NextResponse.json({ error: "No meeting link set for this slot." }, { status: 400 });
  if (slot.bookings.length === 0) return NextResponse.json({ error: "No participants in this slot." }, { status: 400 });

  const date = format(slot.date, "MMMM d, yyyy");
  const day = format(slot.date, "EEEE");

  // Fire all emails in parallel
  await Promise.allSettled(
    slot.bookings.map((b) =>
      sendMeetLinkEmail({
        to: b.email,
        name: b.name,
        date,
        day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        meetingLink: slot.meetingLink!,
      })
    )
  );

  return NextResponse.json({ success: true, sent: slot.bookings.length });
}
