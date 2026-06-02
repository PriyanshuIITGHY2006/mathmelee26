// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  createdAt: string;
}

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookingCount: number;
  meetingLink: string | null;
  interviewer: string | null;
  published: boolean;
  bookings: Booking[];
}

type ActiveView = "home" | "slots" | "participants";

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>("home");
  const [registrationsOpen, setRegistrationsOpen] = useState(true);
  const [togglingReg, setTogglingReg] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/admin/login");
  }, [status, router]);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/bookings");
    if (res.ok) {
      const data = await res.json();
      setSlots(data.slots);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSlots();
      fetch("/api/admin/settings")
        .then((r) => r.json())
        .then((d) => setRegistrationsOpen(d.registrationsOpen ?? true));
    }
  }, [status, fetchSlots]);

  async function toggleRegistrations() {
    setTogglingReg(true);
    const next = !registrationsOpen;
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationsOpen: next }),
    });
    setRegistrationsOpen(next);
    setTogglingReg(false);
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  const totalBookings = slots.reduce((sum, s) => sum + s.bookingCount, 0);
  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => s.bookingCount < s.capacity).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 h-14 px-5 flex items-center justify-between sticky top-0 z-30">
        <button onClick={() => setActiveView("home")} className="flex items-center gap-2.5 group">
          <AdminLogo />
          <div className="leading-tight text-left">
            <div className="text-sm font-semibold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
              Admin Console
            </div>
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.14em] mt-0.5">
              Mathematics Melee '26
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2">
          {activeView !== "home" && (
            <button
              onClick={() => setActiveView("home")}
              className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <BackIcon /> Dashboard
            </button>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1.5 transition-colors flex items-center gap-1.5"
          >
            <LogoutIcon /> Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      {activeView === "home" ? (
        <HomeView
          name={session?.user?.name ?? null}
          loading={loading}
          totalSlots={totalSlots}
          totalBookings={totalBookings}
          availableSlots={availableSlots}
          registrationsOpen={registrationsOpen}
          togglingReg={togglingReg}
          onToggleReg={toggleRegistrations}
          onOpen={setActiveView}
        />
      ) : (
        <main className="flex-1 overflow-auto">
          {activeView === "slots" ? (
            <SlotManagementView slots={slots} loading={loading} onRefresh={fetchSlots} />
          ) : (
            <ParticipantView slots={slots} loading={loading} onRefresh={fetchSlots} />
          )}
        </main>
      )}
    </div>
  );
}

// ─── Dashboard Home (module cards) ─────────────────────────────────────────────

function HomeView({
  name, loading, totalSlots, totalBookings, availableSlots,
  registrationsOpen, togglingReg, onToggleReg, onOpen,
}: {
  name: string | null;
  loading: boolean;
  totalSlots: number;
  totalBookings: number;
  availableSlots: number;
  registrationsOpen: boolean;
  togglingReg: boolean;
  onToggleReg: () => void;
  onOpen: (v: ActiveView) => void;
}) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto w-full px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back{name ? `, ${name}` : ""}. Manage the Mathematics Melee from here.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          <StatTile label="Total slots" value={loading ? "—" : totalSlots} />
          <StatTile label="Registrations" value={loading ? "—" : totalBookings} />
          <StatTile label="Open slots" value={loading ? "—" : availableSlots} accent />
        </div>

        {/* Modules */}
        <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.16em] mt-10 mb-3">Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ModuleCard
            title="Slot Management"
            desc="Create, edit, publish or hold, delay and assign interview panels."
            meta={loading ? "Loading…" : `${totalSlots} slots · ${availableSlots} open`}
            icon={<CalendarIcon />}
            onClick={() => onOpen("slots")}
          />
          <ModuleCard
            title="Participants"
            desc="Search, move between slots, remove and export all registrations."
            meta={loading ? "Loading…" : `${totalBookings} registered`}
            icon={<UsersIcon />}
            onClick={() => onOpen("participants")}
          />

          {/* Registrations control */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${registrationsOpen ? "bg-emerald-50" : "bg-red-50"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${registrationsOpen ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${registrationsOpen ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                {registrationsOpen ? "Open" : "Closed"}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 mt-3">Registrations</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed flex-1">
              {registrationsOpen ? "The public booking form is live." : "The public booking form is closed."}
            </p>
            <button
              onClick={onToggleReg}
              disabled={togglingReg}
              className={`mt-3 w-full text-xs font-medium py-2 rounded-md transition-colors disabled:opacity-50 ${
                registrationsOpen
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              }`}
            >
              {togglingReg ? "Updating…" : registrationsOpen ? "Close Registrations" : "Open Registrations"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div className={`text-2xl font-bold tracking-tight ${accent ? "text-emerald-600" : "text-slate-900"}`}>{value}</div>
      <div className="text-[11px] text-slate-400 uppercase tracking-[0.12em] mt-1">{label}</div>
    </div>
  );
}

function ModuleCard({ title, desc, meta, icon, onClick }: {
  title: string; desc: string; meta: string; icon: React.ReactNode; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-900 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all flex flex-col"
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">{icon}</div>
        <span className="text-slate-300 group-hover:text-slate-900 transition-colors text-lg leading-none">→</span>
      </div>
      <p className="text-sm font-semibold text-slate-900 mt-3">{title}</p>
      <p className="text-xs text-slate-400 mt-1 leading-relaxed flex-1">{desc}</p>
      <p className="text-[11px] font-medium text-slate-500 mt-3 bg-slate-50 border border-slate-100 rounded-md px-2 py-1 self-start">{meta}</p>
    </button>
  );
}

// ─── Slot Management View ─────────────────────────────────────────────────────

function SlotManagementView({
  slots,
  loading,
  onRefresh,
}: {
  slots: Slot[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [form, setForm] = useState({
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    meetingLink: "",
    capacity: "6",
    interviewer: "",
  });
  const [generatingLink, setGeneratingLink] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingPublishId, setTogglingPublishId] = useState<string | null>(null);
  const [sendingMeetId, setSendingMeetId] = useState<string | null>(null);
  const [delaySlot, setDelaySlot] = useState<Slot | null>(null);
  const [delayMinutes, setDelayMinutes] = useState("15");
  const [applyingDelay, setApplyingDelay] = useState(false);

  function updateForm(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generateMeetLink() {
    if (!form.date) {
      setMessage({ type: "error", text: "Please select a date first." });
      return;
    }
    setGeneratingLink(true);
    try {
      const res = await fetch("/api/admin/generate-meet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: form.date, startTime: form.startTime, endTime: form.endTime }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, meetingLink: data.meetLink }));
        setMessage({ type: "success", text: "Meet link generated." });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } finally {
      setGeneratingLink(false);
    }
  }

  async function createSlot() {
    if (!form.date) {
      setMessage({ type: "error", text: "Please enter a date." });
      return;
    }
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, capacity: parseInt(form.capacity) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Slot created successfully." });
        setForm({ date: "", startTime: "09:00", endTime: "10:00", meetingLink: "", capacity: "6", interviewer: "" });
        onRefresh();
      } else {
        setMessage({ type: "error", text: data.error ?? "Failed to create slot." });
      }
    } finally {
      setCreating(false);
    }
  }

  async function sendMeetLink(slotId: string, bookingCount: number) {
    if (bookingCount === 0) { alert("No participants in this slot."); return; }
    if (!confirm(`Send meet link to all ${bookingCount} participant(s) in this slot?`)) return;
    setSendingMeetId(slotId);
    try {
      const res = await fetch(`/api/admin/slots/${slotId}/send-meet`, { method: "POST" });
      const data = await res.json();
      if (res.ok) alert(`Meet link sent to ${data.sent} participant(s).`);
      else alert(data.error ?? "Failed to send.");
    } finally {
      setSendingMeetId(null);
    }
  }

  async function togglePublish(slot: Slot) {
    const next = !slot.published;
    // Holding (unpublishing) is only allowed when the panel has no bookings.
    if (!next && slot.bookingCount > 0) {
      alert("Cannot hold a panel that already has bookings. Move or remove participants first.");
      return;
    }
    setTogglingPublishId(slot.id);
    try {
      const res = await fetch(`/api/slots/${slot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: next }),
      });
      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to update panel.");
      }
    } finally {
      setTogglingPublishId(null);
    }
  }

  async function deleteSlot(slotId: string) {
    setDeletingId(slotId);
    try {
      const res = await fetch(`/api/slots/${slotId}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete slot.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function applyDelay() {
    if (!delaySlot) return;
    setApplyingDelay(true);
    try {
      const res = await fetch(`/api/slots/${delaySlot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delayMinutes: parseInt(delayMinutes) }),
      });
      const data = await res.json();
      if (res.ok) {
        setDelaySlot(null);
        onRefresh();
      } else {
        alert(data.error ?? "Failed to apply delay.");
      }
    } finally {
      setApplyingDelay(false);
    }
  }

  async function saveEdit(slotId: string, updates: Record<string, unknown>) {
    const res = await fetch(`/api/slots/${slotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      setEditingSlot(null);
      onRefresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to update slot.");
    }
  }

  const slotsByDate = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Slot Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">{slots.length} slots total</p>
        </div>
      </div>

      {/* Create Slot Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-slate-900 mb-4">Create new slot</h2>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Date</label>
            <input type="date" value={form.date} onChange={(e) => updateForm("date", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Start time</label>
            <input type="time" value={form.startTime} onChange={(e) => updateForm("startTime", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">End time</label>
            <input type="time" value={form.endTime} onChange={(e) => updateForm("endTime", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Meeting link</label>
            <div className="flex gap-2">
              <input type="url" value={form.meetingLink} onChange={(e) => updateForm("meetingLink", e.target.value)}
                placeholder="https://meet.google.com/..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900" />
              <button onClick={generateMeetLink} disabled={generatingLink}
                className="px-3 py-2 text-xs border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap disabled:opacity-50">
                {generatingLink ? "Generating..." : "Auto-generate"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Capacity</label>
            <input type="number" min="1" max="20" value={form.capacity} onChange={(e) => updateForm("capacity", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Interviewer name</label>
          <input type="text" value={form.interviewer} onChange={(e) => updateForm("interviewer", e.target.value)}
            placeholder="e.g. Dr. Sharma"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>

        {message && (
          <p className={`text-xs px-3 py-2 rounded-md mb-3 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-600 border border-red-100"
          }`}>
            {message.text}
          </p>
        )}

        <button onClick={createSlot} disabled={creating}
          className="bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50">
          {creating ? "Creating..." : "Create Slot"}
        </button>
      </div>

      {/* Slots grouped by date */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : Object.keys(slotsByDate).length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
          No slots yet. Create one above.
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(slotsByDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, dateSlots]) => (
            <div key={date} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                  {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Interviewer</th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Booked</th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Meet link</th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dateSlots.map((slot) => {
                    const isFull = slot.bookingCount >= slot.capacity;
                    const isEmpty = slot.bookingCount === 0;
                    return (
                      <tr key={slot.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-slate-900">{slot.startTime} – {slot.endTime}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          {slot.interviewer ? (
                            <span className="text-sm text-slate-700">{slot.interviewer}</span>
                          ) : (
                            <span className="text-xs text-slate-300 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {slot.bookingCount} / {slot.capacity}
                        </td>
                        <td className="px-5 py-3.5">
                          {slot.meetingLink ? (
                            <a href={slot.meetingLink} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline truncate max-w-[140px] block">
                              {slot.meetingLink.replace("https://", "")}
                            </a>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {!slot.published && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700">
                                Held
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isFull ? "bg-red-50 text-red-600"
                              : isEmpty ? "bg-slate-100 text-slate-500"
                              : "bg-emerald-50 text-emerald-700"
                            }`}>
                              {isFull ? "Full" : isEmpty ? "Empty" : "Open"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={() => setEditingSlot(slot)}
                              className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors">
                              Edit
                            </button>
                            <button
                              onClick={() => togglePublish(slot)}
                              disabled={togglingPublishId === slot.id || (slot.published && slot.bookingCount > 0)}
                              title={slot.published && slot.bookingCount > 0 ? "Cannot hold a panel with bookings" : slot.published ? "Hide this panel from participants" : "Make this panel bookable"}
                              className={`text-xs px-2 py-1 rounded-md border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                                slot.published
                                  ? "text-amber-600 hover:text-amber-800 border-amber-100 hover:bg-amber-50"
                                  : "text-emerald-600 hover:text-emerald-800 border-emerald-100 hover:bg-emerald-50"
                              }`}>
                              {togglingPublishId === slot.id ? "..." : slot.published ? "Hold" : "Publish"}
                            </button>
                            <button onClick={() => setDelaySlot(slot)}
                              className="text-xs text-amber-600 hover:text-amber-800 border border-amber-100 px-2 py-1 rounded-md hover:bg-amber-50 transition-colors">
                              Delay
                            </button>
                            <button
                              onClick={() => sendMeetLink(slot.id, slot.bookingCount)}
                              disabled={!slot.meetingLink || sendingMeetId === slot.id}
                              title={!slot.meetingLink ? "No meet link set" : `Send meet link to ${slot.bookingCount} participant(s)`}
                              className="text-xs text-blue-600 hover:text-blue-800 border border-blue-100 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                              {sendingMeetId === slot.id ? "Sending..." : "Send Meet"}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete this slot?${slot.bookingCount > 0 ? ` This removes ${slot.bookingCount} booking(s).` : ""}`)) {
                                  deleteSlot(slot.id);
                                }
                              }}
                              disabled={deletingId === slot.id}
                              className="text-xs text-red-500 hover:text-red-700 border border-red-100 px-2 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50">
                              {deletingId === slot.id ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {editingSlot && (
        <EditSlotModal slot={editingSlot} onSave={saveEdit} onClose={() => setEditingSlot(null)} />
      )}

      {delaySlot && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-sm font-medium text-slate-900 mb-1">Apply delay</h3>
            <p className="text-xs text-slate-500 mb-4">
              Shift {delaySlot.startTime} – {delaySlot.endTime} forward by:
            </p>
            <div className="flex gap-2 mb-4 flex-wrap">
              {["5", "10", "15", "20", "30", "45", "60"].map((min) => (
                <button key={min} onClick={() => setDelayMinutes(min)}
                  className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                    delayMinutes === min
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}>
                  {min}m
                </button>
              ))}
            </div>
            <div className="mb-4">
              <label className="text-xs text-slate-500 block mb-1">Custom minutes</label>
              <input type="number" min="1" max="300" value={delayMinutes}
                onChange={(e) => setDelayMinutes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <p className="text-xs text-slate-400 mb-4">
              New time:{" "}
              <span className="text-slate-700 font-medium">
                {addMinutesToTime(delaySlot.startTime, parseInt(delayMinutes) || 0)} –{" "}
                {addMinutesToTime(delaySlot.endTime, parseInt(delayMinutes) || 0)}
              </span>
            </p>
            <div className="flex gap-2">
              <button onClick={applyDelay} disabled={applyingDelay}
                className="flex-1 bg-slate-900 text-white text-xs font-medium py-2.5 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50">
                {applyingDelay ? "Applying..." : "Apply Delay"}
              </button>
              <button onClick={() => setDelaySlot(null)}
                className="px-4 text-xs text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Edit Slot Modal ──────────────────────────────────────────────────────────

function EditSlotModal({
  slot,
  onSave,
  onClose,
}: {
  slot: Slot;
  onSave: (id: string, updates: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(slot.date);
  const [startTime, setStartTime] = useState(slot.startTime);
  const [endTime, setEndTime] = useState(slot.endTime);
  const [meetingLink, setMeetingLink] = useState(slot.meetingLink ?? "");
  const [capacity, setCapacity] = useState(String(slot.capacity));
  const [interviewer, setInterviewer] = useState(slot.interviewer ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    onSave(slot.id, { date, startTime, endTime, meetingLink, capacity: parseInt(capacity), interviewer });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-md shadow-xl">
        <h3 className="text-sm font-medium text-slate-900 mb-4">Edit slot</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Start time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">End time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Interviewer name</label>
            <input type="text" value={interviewer} onChange={(e) => setInterviewer(e.target.value)}
              placeholder="e.g. Dr. Sharma"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-300" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Meeting link</label>
            <input type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-300" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Capacity</label>
            <input type="number" min="1" max="20" value={capacity} onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-slate-900 text-white text-xs font-medium py-2.5 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button onClick={onClose}
            className="px-4 text-xs text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Participant View ─────────────────────────────────────────────────────────

function ParticipantView({
  slots,
  loading,
  onRefresh,
}: {
  slots: Slot[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("all");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [movingBooking, setMovingBooking] = useState<{ booking: Booking; slot: Slot } | null>(null);

  const uniqueDates = Array.from(new Set(slots.map((s) => s.date))).sort();

  const filtered = slots.filter((s) => {
    const matchesDate = filterDate === "all" || s.date === filterDate;
    const matchesSearch =
      !search ||
      s.bookings.some(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.email.toLowerCase().includes(search.toLowerCase()) ||
          b.whatsapp.includes(search)
      );
    return matchesDate && (matchesSearch || s.bookings.length === 0);
  });

  const totalBookings = slots.reduce((sum, s) => sum + s.bookingCount, 0);

  async function removeParticipant(bookingId: string) {
    setRemovingId(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to remove participant.");
      }
    } finally {
      setRemovingId(null);
    }
  }

  async function moveParticipant(bookingId: string, targetSlotId: string) {
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: targetSlotId }),
    });
    if (res.ok) {
      setMovingBooking(null);
      onRefresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to move participant.");
    }
  }

  async function downloadExcel() {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) { alert("Export failed."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mathematics-melee-26-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Participants</h1>
          <p className="text-xs text-slate-400 mt-0.5">{totalBookings} total registrations</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none">
            <option value="all">All dates</option>
            {uniqueDates.map((d) => (
              <option key={d} value={d}>{format(parseISO(d), "MMMM d, yyyy")}</option>
            ))}
          </select>
          <input type="text" placeholder="Search name, email, WA" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-700 placeholder:text-slate-300 focus:outline-none w-44" />
          <button onClick={downloadExcel} disabled={downloading}
            className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 font-medium whitespace-nowrap">
            <DownloadIcon />
            {downloading ? "Exporting..." : "Export Excel"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            No results.
          </div>
        ) : (
          filtered.map((slot) => (
            <div key={slot.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {format(parseISO(slot.date), "EEEE, MMMM d, yyyy")} &middot; {slot.startTime} – {slot.endTime}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {slot.interviewer && (
                      <span className="text-xs text-slate-500">
                        Interviewer: <span className="font-medium text-slate-700">{slot.interviewer}</span>
                      </span>
                    )}
                    {slot.meetingLink && (
                      <a href={slot.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline">
                        {slot.meetingLink.replace("https://", "")}
                      </a>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {slot.bookingCount} / {slot.capacity}
                </span>
              </div>

              {slot.bookings.length === 0 ? (
                <div className="px-5 py-4 text-xs text-slate-400">No bookings yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-5 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">#</th>
                      <th className="text-left px-5 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                      <th className="text-left px-5 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                      <th className="text-left px-5 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">WhatsApp</th>
                      <th className="text-left px-5 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Booked at</th>
                      <th className="text-left px-5 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slot.bookings.map((booking, i) => (
                      <tr key={booking.id} className="border-t border-slate-100">
                        <td className="px-5 py-3 text-xs text-slate-400">{i + 1}</td>
                        <td className="px-5 py-3 font-medium text-slate-900">{booking.name}</td>
                        <td className="px-5 py-3 text-slate-600">{booking.email}</td>
                        <td className="px-5 py-3 text-slate-600">{booking.whatsapp}</td>
                        <td className="px-5 py-3 text-xs text-slate-400">
                          {format(new Date(booking.createdAt), "MMM d, HH:mm")}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setMovingBooking({ booking, slot })}
                              className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors">
                              Move
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${booking.name}?`)) removeParticipant(booking.id);
                              }}
                              disabled={removingId === booking.id}
                              className="text-xs text-red-500 hover:text-red-700 border border-red-100 px-2 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50">
                              {removingId === booking.id ? "..." : "Remove"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}
      </div>

      {movingBooking && (
        <MoveParticipantModal
          booking={movingBooking.booking}
          currentSlot={movingBooking.slot}
          slots={slots}
          onMove={moveParticipant}
          onClose={() => setMovingBooking(null)}
        />
      )}
    </div>
  );
}

// ─── Move Participant Modal ───────────────────────────────────────────────────

function MoveParticipantModal({
  booking,
  currentSlot,
  slots,
  onMove,
  onClose,
}: {
  booking: Booking;
  currentSlot: Slot;
  slots: Slot[];
  onMove: (bookingId: string, targetSlotId: string) => Promise<void>;
  onClose: () => void;
}) {
  const [targetSlotId, setTargetSlotId] = useState("");
  const [moving, setMoving] = useState(false);

  // Slots the participant can be moved into: not the current one, and not full.
  const targets = slots
    .filter((s) => s.id !== currentSlot.id && s.bookingCount < s.capacity)
    .sort((a, b) =>
      a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)
    );

  async function handleMove() {
    if (!targetSlotId) return;
    setMoving(true);
    try {
      await onMove(booking.id, targetSlotId);
    } finally {
      setMoving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-md shadow-xl">
        <h3 className="text-sm font-medium text-slate-900 mb-1">Move participant</h3>
        <p className="text-xs text-slate-500 mb-4">
          Move <span className="font-medium text-slate-700">{booking.name}</span> from{" "}
          {format(parseISO(currentSlot.date), "MMM d")} · {currentSlot.startTime}–{currentSlot.endTime} to another slot.
        </p>

        {targets.length === 0 ? (
          <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-md px-3 py-3 mb-4">
            No other slots with available capacity.
          </p>
        ) : (
          <div className="mb-4">
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Target slot</label>
            <select
              value={targetSlotId}
              onChange={(e) => setTargetSlotId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900">
              <option value="">Select a slot…</option>
              {targets.map((s) => (
                <option key={s.id} value={s.id}>
                  {format(parseISO(s.date), "MMM d")} · {s.startTime}–{s.endTime}
                  {s.interviewer ? ` · ${s.interviewer}` : ""} ({s.bookingCount}/{s.capacity})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleMove}
            disabled={moving || !targetSlotId}
            className="flex-1 bg-slate-900 text-white text-xs font-medium py-2.5 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50">
            {moving ? "Moving..." : "Move Participant"}
          </button>
          <button
            onClick={onClose}
            className="px-4 text-xs text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin brand mark ─────────────────────────────────────────────────────────

function AdminLogo() {
  return (
    <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center ring-1 ring-slate-200 shrink-0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        {/* pentagon (Polygon nod) with a converging node graph */}
        <path d="M12 3.2 L19.4 8.8 L16.6 18 L7.4 18 L4.6 8.8 Z" stroke="#ffffff" strokeWidth="1.3" strokeLinejoin="round" opacity="0.9" />
        <path d="M12 12 L12 3.2 M12 12 L19.4 8.8 M12 12 L16.6 18 M12 12 L7.4 18 M12 12 L4.6 8.8" stroke="#ffffff" strokeWidth="0.7" opacity="0.35" />
        <circle cx="12" cy="12" r="2.1" fill="#34d399" />
      </svg>
    </div>
  );
}

function BackIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
