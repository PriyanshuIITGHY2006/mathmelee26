import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import prisma from "@/lib/prisma";
import { SiteHeader } from "@/app/components/SiteHeader";

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
    <main className="min-h-screen bg-white">
      <SiteHeader showAdmin={false} />

      <div className="max-w-md mx-auto px-5 py-16">
        <div className="border border-slate-200 rounded-xl p-8">
          {/* Check icon */}
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-5 h-5 text-emerald-600"
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

          <h1 className="text-xl font-semibold text-slate-900 text-center mb-1">
            Booking confirmed
          </h1>
          <p className="text-sm text-slate-500 text-center mb-7">
            A confirmation has been sent to{" "}
            <span className="text-slate-700 font-medium">{booking.email}</span>
          </p>

          {/* Meet link */}
          {slot.meetingLink && (
            <a
              href={slot.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-lg mb-6 hover:bg-blue-100 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5 shrink-0"
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

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Date", value: format(slot.date, "MMMM d, yyyy") },
              { label: "Time", value: `${slot.startTime} – ${slot.endTime}` },
              { label: "Name", value: booking.name },
              { label: "Booking ID", value: booking.id.slice(0, 12) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-lg px-3.5 py-3">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-medium text-slate-900 break-all">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7 pt-6 border-t border-slate-100 text-center space-y-2">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-700 transition-colors block">
              Return to home
            </Link>
            <p className="text-xs text-slate-300">
              Made a mistake?{" "}
              <a href="mailto:priyanshuib01@gmail.com" className="underline underline-offset-2 hover:text-slate-500 transition-colors">
                Contact the organisers
              </a>{" "}to cancel and re-register.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
