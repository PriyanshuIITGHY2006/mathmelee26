// app/confirmation/[bookingId]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import prisma from "@/lib/prisma";

interface Props {
  params: { bookingId: string };
}

export default async function ConfirmationPage({ params }: Props) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: { slot: true },
  });

  if (!booking) notFound();

  const { slot } = booking;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <span className="text-sm font-medium tracking-tight text-slate-900">
          Competition<span className="text-slate-400 font-normal">2025</span>
        </span>
      </header>

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          {/* Status Icon */}
          <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-5 h-5 text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-xl font-medium text-slate-900 mb-1">
            Booking confirmed
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            A confirmation has been sent to{" "}
            <span className="text-slate-700">{booking.email}</span>
          </p>

          {/* Meet Link */}
          {slot.meetingLink && (
            <a
              href={slot.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-md mb-6 hover:bg-blue-100 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {slot.meetingLink.replace("https://", "")}
            </a>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-left">
            {[
              {
                label: "Date",
                value: format(slot.date, "MMMM d, yyyy"),
              },
              {
                label: "Time",
                value: `${slot.startTime} – ${slot.endTime}`,
              },
              { label: "Name", value: booking.name },
              {
                label: "Booking ID",
                value: booking.id.slice(0, 12),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-slate-50 rounded-lg px-3.5 py-3"
              >
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Return to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
