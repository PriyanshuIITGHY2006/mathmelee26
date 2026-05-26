// app/api/book/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

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

  const { slotId, name, email, whatsapp } = parsed.data; // <-- Extract it here

  try {
    const booking = await prisma.$transaction(
      async (tx) => {
        // 1. Lock the slot row to prevent race conditions.
        // We removed the GROUP BY and COUNT to comply with PostgreSQL's FOR UPDATE rules.
        const lockedSlots = await tx.$queryRaw<
          Array<{
            id: string;
            capacity: number;
          }>
        >`
          SELECT id, capacity 
          FROM "Slot" 
          WHERE id = ${slotId} 
          FOR UPDATE
        `;

        if (lockedSlots.length === 0) {
          throw new BookingError("SLOT_NOT_FOUND", "This slot does not exist.");
        }

        const slot = lockedSlots[0];

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

        // 3. Check for duplicate booking (same email + slot)
        const existingBooking = await tx.booking.findFirst({
          where: { slotId, email },
        });
        
        if (existingBooking) {
          throw new BookingError(
            "DUPLICATE_BOOKING",
            "You have already booked this slot."
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
        timeout: 10_000, // 10 seconds max
      }
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
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
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