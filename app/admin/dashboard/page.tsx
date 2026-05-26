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
  bookings: Booking[];
}

type ActiveView = "slots" | "participants";

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>("slots");

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
    if (status === "authenticated") fetchSlots();
  }, [status, fetchSlots]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  const totalBookings = slots.reduce((sum, s) => sum + s.bookingCount, 0);
  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => s.bookingCount < s.capacity).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-slate-200 flex flex-col py-5 px-3 shrink-0">
        <div className="px-2 mb-6">
          <span className="text-sm font-medium tracking-tight text-slate-900">
            Booking<span className="text-slate-400 font-normal">Portal</span>
          </span>
          <p className="text-xs text-slate-400 mt-0.5">Admin</p>
        </div>

        <nav className="flex flex-col gap-0.5">
          <SidebarItem
            label="Slot Management"
            active={activeView === "slots"}
            onClick={() => setActiveView("slots")}
            icon={<CalendarIcon />}
          />
          <SidebarItem
            label="Participants"
            active={activeView === "participants"}
            onClick={() => setActiveView("participants")}
            icon={<UsersIcon />}
          />
        </nav>

        {/* Stats */}
        <div className="mt-6 mx-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Overview</p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Total slots</span>
              <span className="text-xs font-medium text-slate-900">{totalSlots}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Bookings</span>
              <span className="text-xs font-medium text-slate-900">{totalBookings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Open slots</span>
              <span className="text-xs font-medium text-emerald-600">{availableSlots}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full text-left px-2 py-2 text-xs text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-2"
          >
            <LogoutIcon />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activeView === "slots" ? (
          <SlotManagementView
            slots={slots}
            loading={loading}
            onRefresh={fetchSlots}
          />
        ) : (
          <ParticipantView slots={slots} loading={loading} onRefresh={fetchSlots} />
        )}
      </main>
    </div>
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
  });
  const [generatingLink, setGeneratingLink] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
        body: JSON.stringify({
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
        }),
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
        body: JSON.stringify({
          ...form,
          capacity: parseInt(form.capacity),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Slot created successfully." });
        setForm({ date: "", startTime: "09:00", endTime: "10:00", meetingLink: "", capacity: "6" });
        onRefresh();
      } else {
        setMessage({ type: "error", text: data.error ?? "Failed to create slot." });
      }
    } finally {
      setCreating(false);
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

  async function saveEdit(slotId: string, updates: Partial<Slot & { meetingLink: string }>) {
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

  // Group slots by date
  const slotsByDate = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-slate-900">Slot Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">{slots.length} slots total</p>
        </div>
      </div>

      {/* Create Slot Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-slate-900 mb-4">Create new slot</h2>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => updateForm("date", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Start time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => updateForm("startTime", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">End time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => updateForm("endTime", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Meeting link</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.meetingLink}
                onChange={(e) => updateForm("meetingLink", e.target.value)}
                placeholder="https://meet.google.com/..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                onClick={generateMeetLink}
                disabled={generatingLink}
                className="px-3 py-2 text-xs border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {generatingLink ? "Generating..." : "Auto-generate"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Capacity</label>
            <input
              type="number"
              min="1"
              max="20"
              value={form.capacity}
              onChange={(e) => updateForm("capacity", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
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

        <button
          onClick={createSlot}
          disabled={creating}
          className="bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Slot"}
        </button>
      </div>

      {/* Slots Table grouped by date */}
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
                          <p className="font-medium text-slate-900">
                            {slot.startTime} – {slot.endTime}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {slot.bookingCount} / {slot.capacity}
                        </td>
                        <td className="px-5 py-3.5">
                          {slot.meetingLink ? (
                            <a href={slot.meetingLink} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline truncate max-w-[160px] block">
                              {slot.meetingLink.replace("https://", "")}
                            </a>
                          ) : (
                            <span className="text-xs text-slate-300">None</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isFull ? "bg-red-50 text-red-600"
                            : isEmpty ? "bg-slate-100 text-slate-500"
                            : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {isFull ? "Sold Out" : isEmpty ? "Empty" : "Open"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingSlot(slot)}
                              className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDelaySlot(slot)}
                              className="text-xs text-amber-600 hover:text-amber-800 border border-amber-100 px-2 py-1 rounded-md hover:bg-amber-50 transition-colors"
                            >
                              Delay
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete this slot? ${slot.bookingCount > 0 ? `This will also remove ${slot.bookingCount} booking(s).` : ""}`)) {
                                  deleteSlot(slot.id);
                                }
                              }}
                              disabled={deletingId === slot.id}
                              className="text-xs text-red-500 hover:text-red-700 border border-red-100 px-2 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
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

      {/* Edit Modal */}
      {editingSlot && (
        <EditSlotModal
          slot={editingSlot}
          onSave={saveEdit}
          onClose={() => setEditingSlot(null)}
        />
      )}

      {/* Delay Modal */}
      {delaySlot && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-sm font-medium text-slate-900 mb-1">Apply delay</h3>
            <p className="text-xs text-slate-500 mb-4">
              Shift {delaySlot.startTime} – {delaySlot.endTime} forward by:
            </p>
            <div className="flex gap-2 mb-4">
              {["5", "10", "15", "20", "30", "45", "60"].map((min) => (
                <button
                  key={min}
                  onClick={() => setDelayMinutes(min)}
                  className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                    delayMinutes === min
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
            <div className="mb-4">
              <label className="text-xs text-slate-500 block mb-1">Or enter custom minutes</label>
              <input
                type="number"
                min="1"
                max="300"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <p className="text-xs text-slate-400 mb-4">
              New time will be:{" "}
              <span className="text-slate-700 font-medium">
                {addMinutesToTime(delaySlot.startTime, parseInt(delayMinutes) || 0)} –{" "}
                {addMinutesToTime(delaySlot.endTime, parseInt(delayMinutes) || 0)}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={applyDelay}
                disabled={applyingDelay}
                className="flex-1 bg-slate-900 text-white text-xs font-medium py-2.5 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {applyingDelay ? "Applying..." : "Apply Delay"}
              </button>
              <button
                onClick={() => setDelaySlot(null)}
                className="px-4 text-xs text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
              >
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
  const [startTime, setStartTime] = useState(slot.startTime);
  const [endTime, setEndTime] = useState(slot.endTime);
  const [meetingLink, setMeetingLink] = useState(slot.meetingLink ?? "");
  const [capacity, setCapacity] = useState(String(slot.capacity));
  const [date, setDate] = useState(slot.date);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(slot.id, {
      date,
      startTime,
      endTime,
      meetingLink,
      capacity: parseInt(capacity),
    });
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

  const uniqueDates = Array.from(new Set(slots.map((s) => s.date))).sort();

  const filtered = slots.filter((s) => {
    const matchesDate = filterDate === "all" || s.date === filterDate;
    const matchesSearch =
      !search ||
      s.bookings.some(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.email.toLowerCase().includes(search.toLowerCase()) ||
          (b.whatsapp && b.whatsapp.includes(search)) // <-- Added WhatsApp search
      );
    return matchesDate && (matchesSearch || s.bookings.length === 0);
  });

  async function removeParticipant(bookingId: string) {
    setRemovingId(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
      });
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

  const totalBookings = slots.reduce((sum, s) => sum + s.bookingCount, 0);

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-slate-900">Participants</h1>
          <p className="text-xs text-slate-400 mt-0.5">{totalBookings} total bookings</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All dates</option>
            {uniqueDates.map((d) => (
              <option key={d} value={d}>
                {format(parseISO(d), "MMMM d, yyyy")}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-700 placeholder:text-slate-300 focus:outline-none w-48"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            No results found.
          </div>
        ) : (
          filtered.map((slot) => (
            <div key={slot.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {format(parseISO(slot.date), "EEEE, MMMM d, yyyy")} &middot;{" "}
                    {slot.startTime} – {slot.endTime}
                  </p>
                  {slot.meetingLink && (
                    <a href={slot.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline mt-0.5 block">
                      {slot.meetingLink.replace("https://", "")}
                    </a>
                  )}
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
                      {/* NEW WHATSAPP HEADER */}
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
                        {/* NEW WHATSAPP DATA ROW */}
                        <td className="px-5 py-3 text-slate-600">{booking.whatsapp}</td> 
                        <td className="px-5 py-3 text-xs text-slate-400">
                          {format(new Date(booking.createdAt), "MMM d, HH:mm")}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${booking.name} from this slot?`)) {
                                removeParticipant(booking.id);
                              }
                            }}
                            disabled={removingId === booking.id}
                            className="text-xs text-red-500 hover:text-red-700 border border-red-100 px-2 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {removingId === booking.id ? "..." : "Remove"}
                          </button>
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
    </div>
  );
}

// ─── Sidebar Components ───────────────────────────────────────────────────────

function SidebarItem({ label, active, onClick, icon }: {
  label: string; active: boolean; onClick: () => void; icon: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-xs text-left transition-colors ${
        active ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}>
      {icon}{label}
    </button>
  );
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
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