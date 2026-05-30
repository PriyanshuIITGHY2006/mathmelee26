"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { SiteHeader } from "@/app/components/SiteHeader";

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
  const [whatsapp, setWhatsapp] = useState("");

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
    if (!name.trim() || !email.trim() || !whatsapp.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          name: name.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
        }),
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
              className="border border-slate-100 rounded-xl h-12 animate-pulse bg-slate-50"
            />
          ))}
        </div>
      </PageShell>
    );
  }

  if (!slot) {
    return (
      <PageShell>
        <div className="border border-slate-200 rounded-xl p-10 text-center mt-8">
          <p className="text-sm text-slate-400">Slot not found.</p>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-700 mt-3 inline-block"
          >
            Return home
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
        className="text-xs text-slate-400 hover:text-slate-700 transition-colors mb-8 inline-flex items-center gap-1"
      >
        ← Back to slots
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">
          Complete your booking
        </h1>
        <p className="text-sm text-slate-500">
          Fill in your details to confirm your spot.
        </p>
      </div>

      {/* Slot summary card */}
      <div className="border border-slate-200 rounded-xl p-5 mb-5 bg-slate-50">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
              Session
            </p>
            <p className="text-sm font-medium text-slate-900">
              {format(parsedDate, "EEEE, MMMM d")}
            </p>
            <p className="text-sm text-slate-600">
              {slot.startTime} – {slot.endTime}
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-xs font-medium ${
                remaining <= 1 ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {remaining === 0
                ? "No spots left"
                : remaining === 1
                ? "Last spot"
                : `${remaining} spots left`}
            </p>
          </div>
        </div>
      </div>

      {remaining <= 0 ? (
        <div className="border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-700 font-medium mb-2">
            This slot is fully booked.
          </p>
          <Link
            href={`/book/${date}`}
            className="text-xs text-slate-400 hover:text-slate-700"
          >
            View other slots →
          </Link>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl p-5 bg-white">
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
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
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
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                WhatsApp number
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
              <p className="text-xs text-slate-400 mt-1">
                Enter digits only, without country code.
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
            >
              {submitting ? "Confirming…" : "Confirm Booking"}
            </button>

            <p className="text-xs text-slate-400 text-center">
              Each participant may only register once.
            </p>
          </form>
        </div>
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-xl mx-auto px-5 py-12">{children}</div>
    </main>
  );
}
