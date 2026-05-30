import { format } from "date-fns";
import prisma from "@/lib/prisma";
import { CalendarView } from "./components/CalendarView";
import { WelcomeHero } from "./components/WelcomeHero";
import { SiteHeader } from "./components/SiteHeader";
export const dynamic = "force-dynamic";

async function getAllDatesWithSlots() {
  const slots = await prisma.slot.findMany({
    orderBy: { date: "asc" },
    include: { _count: { select: { bookings: true } } },
  });

  const dateMap = new Map<
    string,
    { totalSlots: number; availableSlots: number; date: Date }
  >();

  for (const slot of slots) {
    const dateStr = format(slot.date, "yyyy-MM-dd");
    const existing = dateMap.get(dateStr);
    const isAvailable = slot._count.bookings < slot.capacity;
    if (existing) {
      existing.totalSlots++;
      if (isAvailable) existing.availableSlots++;
    } else {
      dateMap.set(dateStr, {
        totalSlots: 1,
        availableSlots: isAvailable ? 1 : 0,
        date: slot.date,
      });
    }
  }

  return Array.from(dateMap.entries()).map(([dateStr, info]) => ({
    dateStr,
    availableSlots: info.availableSlots,
    totalSlots: info.totalSlots,
  }));
}

export default async function HomePage() {
  const dates = await getAllDatesWithSlots();

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <WelcomeHero />
      <div className="h-px bg-slate-100 mx-5" />
      <div className="max-w-lg mx-auto px-5 py-12">
        {dates.length === 0 ? (
          <div className="border border-slate-200 rounded-2xl p-14 text-center">
            <p className="text-sm text-slate-400">
              No sessions scheduled yet. Check back soon.
            </p>
          </div>
        ) : (
          <CalendarView dates={dates} />
        )}
        <p className="text-xs text-slate-300 text-center mt-10">
          Having trouble? Contact the organiser directly.
        </p>
      </div>
    </main>
  );
}
