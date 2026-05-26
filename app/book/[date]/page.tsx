// app/book/[date]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookingCount: number;
}

export default function DateSlotsPage() {
  const { date } = useParams<{ date: string }>();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/slots?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        setLoading(false);
      });
  }, [date]);

  const parsedDate = parseISO(date);
  const formattedDate = format(parsedDate, "EEEE, MMMM d");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <span className="text-sm font-medium tracking-tight text-slate-900">
          Competition<span className="text-slate-400 font-normal">2025</span>
        </span>
        <Link
          href="/admin/login"
          className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          Admin
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors mb-6 inline-block"
        >
          Back to dates
        </Link>

        <h1 className="text-2xl font-medium tracking-tight text-slate-900 mb-1">
          {formattedDate}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Select a time slot to continue. Spots are reserved on a first-come,
          first-served basis.
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-lg h-16 animate-pulse"
              />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-500 text-sm">
              No slots have been scheduled for this date yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => {
              const remaining = slot.capacity - slot.bookingCount;
              const isFull = remaining <= 0;
              const fillPct = Math.min(
                (slot.bookingCount / slot.capacity) * 100,
                100
              );

              return (
                <div
                  key={slot.id}
                  className={`bg-white border rounded-lg px-5 py-4 flex items-center justify-between transition-all
                    ${isFull
                      ? "border-slate-200 opacity-60"
                      : "border-slate-200 hover:border-slate-400"
                    }`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {slot.startTime} — {slot.endTime}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      1 hour session
                    </p>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull ? "bg-red-400" : "bg-slate-900"
                          }`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                      <p
                        className={`text-xs ${
                          isFull ? "text-red-500" : "text-slate-500"
                        }`}
                      >
                        {isFull
                          ? "Sold out"
                          : `${slot.bookingCount} / ${slot.capacity} spots`}
                      </p>
                    </div>

                    <button
                      disabled={isFull}
                      onClick={() =>
                        router.push(`/book/${date}/${slot.id}`)
                      }
                      className={`text-xs px-4 py-2 rounded-md font-medium transition-all
                        ${isFull
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 text-white hover:bg-slate-700"
                        }`}
                    >
                      {isFull ? "Sold Out" : "Select"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
