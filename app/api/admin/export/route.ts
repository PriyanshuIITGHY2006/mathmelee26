import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import * as XLSX from "xlsx";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const slots = await prisma.slot.findMany({
    include: { bookings: { orderBy: { createdAt: "asc" } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  // Sheet 1: Schedule overview
  const scheduleRows = slots.map((slot) => ({
    Date: format(slot.date, "MMMM d, yyyy"),
    Day: format(slot.date, "EEEE"),
    "Start Time": slot.startTime,
    "End Time": slot.endTime,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Interviewer: (slot as any).interviewer ?? "—",
    "Spots Used": slot.bookings.length,
    Capacity: slot.capacity,
    Status: slot.bookings.length >= slot.capacity ? "Full" : "Open",
  }));

  // Sheet 2: All participants
  const participantRows: Record<string, string | number>[] = [];
  let n = 1;
  for (const slot of slots) {
    for (const b of slot.bookings) {
      participantRows.push({
        "#": n++,
        Name: b.name,
        Email: b.email,
        WhatsApp: b.whatsapp,
        Date: format(slot.date, "MMMM d, yyyy"),
        Day: format(slot.date, "EEEE"),
        Time: `${slot.startTime} – ${slot.endTime}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Interviewer: (slot as any).interviewer ?? "—",
        "Booked At": format(new Date(b.createdAt), "MMM d, yyyy HH:mm"),
      });
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(scheduleRows), "Schedule");
  XLSX.utils.book_append_sheet(
    wb,
    participantRows.length > 0
      ? XLSX.utils.json_to_sheet(participantRows)
      : XLSX.utils.aoa_to_sheet([["No participants yet."]]),
    "Participants"
  );

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const filename = `mathematics-melee-26-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
