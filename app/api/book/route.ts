// app/api/book/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { format } from "date-fns";
import { waitUntil } from "@vercel/functions";
import prisma from "@/lib/prisma";
import { sendConfirmationEmail } from "@/lib/email";
import { getRegistrationsOpen } from "@/lib/settings";

const BookingSchema = z.object({
  slotId: z.string().min(1),
  name: z.string().min(2).max(120).trim(),
  email: z.string().email().toLowerCase().trim(),
  whatsapp: z.string().min(10).max(15).trim(), // <-- ADD THIS
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { slotId, name, email, whatsapp } = parsed.data;

  // Check if registrations are open
  const isOpen = await getRegistrationsOpen();
  if (!isOpen) {
    return NextResponse.json(
      { error: "Registrations are currently closed. Please contact the organisers." },
      { status: 403 }
    );
  }

  try {
    const booking = await prisma.$transaction(
      async (tx) => {
        // 1. Lock the slot row to prevent race conditions.
        // We removed the GROUP BY and COUNT to comply with PostgreSQL's FOR UPDATE rules.
        const lockedSlots = await tx.$queryRaw<
          Array<{
            id: string;
            capacity: number;
            published: boolean;
          }>
        >`
          SELECT id, capacity, published
          FROM "Slot"
          WHERE id = ${slotId}
          FOR UPDATE
        `;

        if (lockedSlots.length === 0) {
          throw new BookingError("SLOT_NOT_FOUND", "This slot does not exist.");
        }

        const slot = lockedSlots[0];

        // Held (unpublished) panels are not open for booking.
        if (slot.published === false) {
          throw new BookingError("SLOT_NOT_FOUND", "This slot is not available for booking.");
        }

        // 2. Safely count the bookings now that the parent row is locked
        const bookingCount = await tx.booking.count({
          where: { slotId },
        });

        if (bookingCount >= slot.capacity) {
          throw new BookingError(
            "SLOT_FULL",
            "This slot is fully booked. Please choose another time."
          );
        }

        // 3. Check for duplicate booking — one booking per WhatsApp number globally
        const existingBooking = await tx.booking.findFirst({
          where: { whatsapp },
        });

        if (existingBooking) {
          throw new BookingError(
            "DUPLICATE_BOOKING",
            "This WhatsApp number has already been used to register. Each participant may only book once."
          );
        }

        // 4. All checks passed — create the booking
        // 4. All checks passed — create the booking
        return tx.booking.create({
          data: { slotId, name, email, whatsapp }, // <-- Add whatsapp here
        });
      },
      {
        isolationLevel: "Serializable",
        timeout: 5_000,
      }
    );

    // waitUntil keeps the serverless function alive until email is sent
    waitUntil(
      prisma.slot.findUnique({ where: { id: booking.slotId } }).then((slot) => {
        if (slot) {
          return sendConfirmationEmail({
            to: booking.email,
            name: booking.name,
            date: format(slot.date, "MMMM d, yyyy"),
            day: format(slot.date, "EEEE"),
            startTime: slot.startTime,
            endTime: slot.endTime,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            interviewer: (slot as any).interviewer ?? null,
            bookingId: booking.id,
            meetingLink: slot.meetingLink,
          });
        }
      })
    );

    return NextResponse.json(
      { success: true, bookingId: booking.id },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof BookingError) {
      const statusMap: Record<string, number> = {
        SLOT_NOT_FOUND: 404,
        SLOT_FULL: 409,
        DUPLICATE_BOOKING: 409,
      };
      return NextResponse.json(
        { error: err.message },
        { status: statusMap[err.code] ?? 400 }
      );
    }

    console.error("[/api/book] Unexpected error:", err);
    const isTimeout = err instanceof Error && err.message.toLowerCase().includes("timeout");
    return NextResponse.json(
      {
        error: isTimeout
          ? "The server is busy right now. Please wait a moment and try again."
          : "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}

class BookingError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "BookingError";
  }
}