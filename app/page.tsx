// app/page.tsx
// Dynamically shows all dates that have slots — not hardcoded to June 4-7.

import Link from "next/link";
import { format } from "date-fns";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
async function getAllDatesWithSlots() {
  const slots = await prisma.slot.findMany({
    orderBy: { date: "asc" },
    include: { _count: { select: { bookings: true } } },
  });

  // Group by date string
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
    ...info,
  }));
}

export default async function HomePage() {
  const dates = await getAllDatesWithSlots();

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-14">
        <p className="text-xs font-medium tracking-widest text-slate-400 uppercase mb-3">
          Booking Portal
        </p>
        <h1 className="text-3xl font-medium tracking-tight text-slate-900 mb-2">
          Reserve your session
        </h1>
        <p className="text-slate-500 text-sm mb-10">
          Select a date to view available time slots. Each session accommodates
          up to 6 participants on a first-come, first-served basis.
        </p>

        {dates.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-slate-500 text-sm">
              No sessions have been scheduled yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {dates.map(({ dateStr, totalSlots, availableSlots, date }) => {
              const isSoldOut = totalSlots > 0 && availableSlots === 0;
              const statusColor = isSoldOut
                ? "text-red-500"
                : availableSlots <= 2
                ? "text-amber-600"
                : "text-emerald-600";

              return (
                <Link
                  key={dateStr}
                  href={isSoldOut ? "#" : `/book/${dateStr}`}
                  className={`group bg-white border border-slate-200 rounded-xl p-5 transition-all
                    ${isSoldOut
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:border-slate-400 hover:shadow-sm"
                    }`}
                >
                  <p className="text-xs tracking-widest text-slate-400 uppercase mb-1">
                    {format(date, "MMMM yyyy")}
                  </p>
                  <p className="text-4xl font-medium tracking-tighter text-slate-900 leading-none">
                    {format(date, "dd")}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {format(date, "EEEE")}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className={`text-xs font-medium ${statusColor}`}>
                      {isSoldOut
                        ? "All slots sold out"
                        : `${availableSlots} of ${totalSlots} slots open`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <p className="text-xs text-slate-400 text-center mt-10">
          Having trouble? Contact the organiser directly.
        </p>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
      <span className="text-sm font-medium tracking-tight text-slate-900">
        Booking<span className="text-slate-400 font-normal">Portal</span>
      </span>
      <Link
        href="/admin/login"
        className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
      >
        Admin
      </Link>
    </header>
  );
}