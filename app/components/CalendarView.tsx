"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
  parseISO,
  isSameDay,
} from "date-fns";

interface SlotDate {
  dateStr: string;
  availableSlots: number;
  totalSlots: number;
}

interface SlotDetail {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookingCount: number;
}

export function CalendarView({ dates }: { dates: SlotDate[] }) {
  const router = useRouter();
  const today = startOfDay(new Date());

  const upcoming = dates.filter((d) => !isBefore(parseISO(d.dateStr), today));
  const [currentMonth, setCurrentMonth] = useState(() =>
    upcoming.length > 0
      ? startOfMonth(parseISO(upcoming[0].dateStr))
      : startOfMonth(today)
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotDetail[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const slotMap = new Map(dates.map((d) => [d.dateStr, d]));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Monday-first offset: Mon=0 … Sun=6
  const firstDayOffset = (getDay(startOfMonth(currentMonth)) + 6) % 7;

  async function handleDateClick(dateStr: string) {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
      setSlots([]);
      return;
    }
    setSelectedDate(dateStr);
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/slots?date=${dateStr}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } finally {
      setLoadingSlots(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Calendar card */}
      <div className="border border-slate-200 rounded-2xl p-6 bg-white">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              setCurrentMonth((m) => subMonths(m, 1));
              setSelectedDate(null);
              setSlots([]);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors text-sm"
          >
            ‹
          </button>
          <h2 className="text-sm font-semibold text-slate-900">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => {
              setCurrentMonth((m) => addMonths(m, 1));
              setSelectedDate(null);
              setSlots([]);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors text-sm"
          >
            ›
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-slate-400 pb-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}

          {daysInMonth.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const info = slotMap.get(dateStr);
            const isPast = isBefore(day, today);
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate === dateStr;
            const hasAvailable = !!info && info.availableSlots > 0 && !isPast;
            const isSoldOut = !!info && info.availableSlots === 0;

            return (
              <div key={dateStr} className="flex items-center justify-center py-0.5">
                <button
                  disabled={!hasAvailable && !isSelected}
                  onClick={() => hasAvailable && handleDateClick(dateStr)}
                  className={[
                    "relative w-9 h-9 rounded-full text-sm transition-all flex items-center justify-center",
                    isSelected
                      ? "bg-slate-900 text-white font-semibold"
                      : hasAvailable
                      ? "hover:bg-slate-100 text-slate-900 font-medium cursor-pointer"
                      : isSoldOut
                      ? "text-slate-300 cursor-not-allowed"
                      : isPast
                      ? "text-slate-200 cursor-default"
                      : "text-slate-400 cursor-default",
                    isToday && !isSelected
                      ? "ring-2 ring-offset-1 ring-slate-300"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {format(day, "d")}
                  {/* Availability dot */}
                  {(hasAvailable || isSoldOut) && !isSelected && (
                    <span
                      className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                        hasAvailable ? "bg-emerald-500" : "bg-red-300"
                      }`}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs text-slate-400">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-300 shrink-0" />
            <span className="text-xs text-slate-400">Sold out</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full ring-2 ring-slate-300 shrink-0" />
            <span className="text-xs text-slate-400">Today</span>
          </div>
        </div>
      </div>

      {/* Slot panel — appears below calendar when date is selected */}
      {selectedDate && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-0.5">
                Available intervals
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {format(parseISO(selectedDate), "EEEE, MMMM d")}
              </p>
            </div>
            <button
              onClick={() => { setSelectedDate(null); setSlots([]); }}
              className="text-slate-400 hover:text-slate-700 text-lg leading-none transition-colors"
            >
              ×
            </button>
          </div>

          {loadingSlots ? (
            <div className="p-4 space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-slate-50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400">
              No slots available for this date.
            </p>
          ) : (
            <div className="p-3 space-y-2">
              {slots.map((slot) => {
                const remaining = slot.capacity - slot.bookingCount;
                const isFull = remaining <= 0;
                const isLast = remaining === 1;

                return (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      isFull
                        ? "border-slate-100 bg-slate-50"
                        : "border-slate-200 hover:border-slate-900"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isFull ? "text-slate-400" : "text-slate-900"
                        }`}
                      >
                        {slot.startTime} – {slot.endTime}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          isFull
                            ? "text-slate-300"
                            : isLast
                            ? "text-amber-600"
                            : "text-slate-400"
                        }`}
                      >
                        {isFull
                          ? "No vacancies"
                          : isLast
                          ? "Last vacancy"
                          : `${remaining} vacancies`}
                      </p>
                    </div>
                    <button
                      disabled={isFull}
                      onClick={() =>
                        router.push(`/book/${selectedDate}/${slot.id}`)
                      }
                      className={`text-xs px-4 py-2 rounded-lg font-medium transition-all ${
                        isFull
                          ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                          : "bg-slate-900 text-white hover:bg-slate-700"
                      }`}
                    >
                      {isFull ? "Full" : "Register →"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
