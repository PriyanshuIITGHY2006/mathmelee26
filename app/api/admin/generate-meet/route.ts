// app/api/admin/generate-meet/route.ts
// Admin-only endpoint that creates a Google Calendar event and returns the Meet URL.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createMeetEvent } from "@/lib/google-calendar";
import { z } from "zod";

const Schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotId: z.string().optional(), // if provided, update the slot's meeting link
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { googleRefreshToken: true },
  });

  if (!user?.googleRefreshToken) {
    return NextResponse.json(
      { error: "Google Calendar not connected. Please sign in again." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 422 });
  }

  const { date, startTime, endTime, slotId } = parsed.data;

  // Build ISO 8601 date-times (assuming IST: UTC+5:30)
  const startISO = `${date}T${startTime}:00+05:30`;
  const endISO = `${date}T${endTime}:00+05:30`;

  try {
    const { meetLink } = await createMeetEvent(user.googleRefreshToken, {
      summary: `Competition 2025 — ${date} ${startTime}`,
      description: "Competition session booking",
      startDateTime: startISO,
      endDateTime: endISO,
    });

    // Optionally update the slot in the database
    if (slotId) {
      await prisma.slot.update({
        where: { id: slotId },
        data: { meetingLink: meetLink },
      });
    }

    return NextResponse.json({ meetLink });
  } catch (err) {
    console.error("[generate-meet] Google Calendar error:", err);
    return NextResponse.json(
      { error: "Failed to create Google Meet link. Check Calendar permissions." },
      { status: 500 }
    );
  }
}
