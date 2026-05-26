// app/book/[date]/[slotId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";

interface SlotDetail {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookingCount: number;
}

export default function BookingFormPage() {
  const { date, slotId } = useParams<{ date: string; slotId: string }>();
  const router = useRouter();

  const [slot, setSlot] = useState<SlotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState(""); // <-- ADD THIS

  useEffect(() => {
    fetch(`/api/slots/${slotId}`)
      .then((r) => r.json())
      .then((data) => {
        setSlot(data.slot ?? null);
        setLoading(false);
      });
  }, [slotId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Add whatsapp to the JSON body:
        body: JSON.stringify({ slotId, name: name.trim(), email: email.trim(), whatsapp: whatsapp.trim() }), 
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/confirmation/${data.bookingId}`);
    } catch {
      setError("A network error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-3 mt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-lg h-12 animate-pulse"
            />
          ))}
        </div>
      </PageShell>
    );
  }

  if (!slot) {
    return (
      <PageShell>
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center mt-8">
          <p className="text-slate-500 text-sm">
            This slot could not be found.
          </p>
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-700 mt-3 inline-block">
            Return to home
          </Link>
        </div>
      </PageShell>
    );
  }

  const remaining = slot.capacity - slot.bookingCount;
  const parsedDate = parseISO(date);

  return (
    <PageShell>
      <Link
        href={`/book/${date}`}
        className="text-xs text-slate-400 hover:text-slate-700 transition-colors mb-6 inline-block"
      >
        Back to slots
      </Link>

      <h1 className="text-2xl font-medium tracking-tight text-slate-900 mb-1">
        Complete your booking
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Fill in your details to confirm your spot.
      </p>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Slot Summary */}
        <div className="pb-5 mb-5 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-900">
            {format(parsedDate, "EEEE, MMMM d")} &middot;{" "}
            {slot.startTime} &ndash; {slot.endTime}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {remaining > 1
              ? `${remaining - 1} spots remaining after your booking`
              : remaining === 1
              ? "This is the last spot"
              : "No spots remaining"}
          </p>
        </div>

        {remaining <= 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-red-600 font-medium">
              This slot is now fully booked.
            </p>
            <Link
              href={`/book/${date}`}
              className="text-xs text-slate-500 hover:text-slate-800 mt-2 inline-block"
            >
              View other slots
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                Full name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                WhatsApp Number
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+919876543210"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-900 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? "Confirming..." : "Confirm Booking"}
            </button>

            <p className="text-xs text-slate-400 text-center">
              By confirming, you agree to the competition terms.
            </p>
          </form>
        )}
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
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
      <div className="max-w-xl mx-auto px-4 py-12">{children}</div>
    </main>
  );
}
