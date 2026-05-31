"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { SiteHeader } from "@/app/components/SiteHeader";

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

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      <div className="max-w-2xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors mb-8 inline-flex items-center gap-1"
        >
          ← Back to dates
        </Link>

        <div className="mb-8">
          <p className="text-xs font-medium tracking-widest text-slate-400 uppercase mb-1">
            {format(parsedDate, "MMMM yyyy")}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {format(parsedDate, "EEEE, MMMM d")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose your interval below. Slots are finite.
          </p>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-100 rounded-xl h-16 animate-pulse bg-slate-50" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-sm text-slate-400">No slots scheduled for this date.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => {
              const remaining = slot.capacity - slot.bookingCount;
              const isFull = remaining <= 0;
              const fillPct = Math.min((slot.bookingCount / slot.capacity) * 100, 100);

              return (
                <div
                  key={slot.id}
                  className={`border rounded-xl px-5 py-4 flex items-center justify-between transition-all ${
                    isFull ? "border-slate-100 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-900"
                  }`}
                >
                  <div>
                    <p className={`text-sm font-medium ${isFull ? "text-slate-400" : "text-slate-900"}`}>
                      {slot.startTime} — {slot.endTime}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isFull ? "No vacancies" : remaining === 1 ? "Last element" : `${remaining} vacancies`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full transition-all ${isFull ? "bg-slate-300" : "bg-slate-900"}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400">{slot.bookingCount}/{slot.capacity}</p>
                    </div>
                    <button
                      disabled={isFull}
                      onClick={() => router.push(`/book/${date}/${slot.id}`)}
                      className={`text-xs px-4 py-2 rounded-lg font-medium transition-all ${
                        isFull ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-slate-700"
                      }`}
                    >
                      {isFull ? "Full" : "Select"}
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
