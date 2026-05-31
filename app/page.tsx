import { format } from "date-fns";
import prisma from "@/lib/prisma";
import { CalendarView } from "./components/CalendarView";
import { WelcomeHero } from "./components/WelcomeHero";
import { SiteHeader } from "./components/SiteHeader";
import { getRegistrationsOpen } from "@/lib/settings";
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
  const [dates, registrationsOpen] = await Promise.all([
    getAllDatesWithSlots(),
    getRegistrationsOpen(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <WelcomeHero />
      <div className="h-px bg-slate-100 mx-5" />
      <div className="max-w-lg mx-auto px-5 py-12">
        {!registrationsOpen ? (
          <div className="border border-red-100 bg-red-50 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5V7" />
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-700 mb-2">Registrations Closed</h2>
            <p className="text-sm text-red-500 mb-5 leading-relaxed">
              Bookings for the Supremum Round are no longer being accepted.
            </p>
            <p className="text-xs text-red-400">
              If you made an error in your registration or need to cancel,{" "}
              <span className="font-medium">contact the organisers at{" "}
                <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "priyanshuib01@gmail.com"}`}
                  className="underline underline-offset-2">
                  {process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "priyanshuib01@gmail.com"}
                </a>
              </span>
            </p>
          </div>
        ) : dates.length === 0 ? (
          <div className="border border-slate-200 rounded-2xl p-14 text-center">
            <p className="text-sm text-slate-400">
              No sessions scheduled yet. Check back soon.
            </p>
          </div>
        ) : (
          <CalendarView dates={dates} />
        )}

        {registrationsOpen && (
          <p className="text-xs text-slate-400 text-center mt-6">
            Made a mistake or want to cancel?{" "}
            <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "priyanshuib01@gmail.com"}`}
              className="underline underline-offset-2 hover:text-slate-700 transition-colors">
              Contact the organisers.
            </a>
          </p>
        )}

        <p className="text-xs text-slate-300 text-center mt-3">
          Having trouble? Contact the organiser directly.
        </p>
      </div>
    </main>
  );
}
