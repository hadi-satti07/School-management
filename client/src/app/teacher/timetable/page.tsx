"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  X,
  Loader2,
  AlertTriangle
} from "lucide-react";

// --- Types Matching Backend Data Matrix ---
interface SlotDetail {
  id: string;
  className: string;   // e.g. Grade 10-A
  subject: string;     // e.g. Mathematics
  roomNumber: string;  // e.g. R-101
  startTime: string;   // e.g. 08:00 AM
  endTime: string;     // e.g. 09:00 AM
}

interface DayTimetable {
  day: string; // Monday, Tuesday, etc.
  slots: SlotDetail[];
}

const availableClasses = ["Grade 9-A", "Grade 9-B", "Grade 10-A", "Grade 10-B", "Grade 11-A", "Grade 11-B"];
const availableSubjects = ["Mathematics", "General Math", "Advanced Algebra", "Statistics"];

export default function TeacherTimetablePage() {
  const [timetable, setTimetable] = useState<DayTimetable[]>([]);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State for Adding/Editing Slot
  const [newSlot, setNewSlot] = useState({
    className: "Grade 10-A",
    subject: "Mathematics",
    roomNumber: "",
    startTime: "08:00 AM",
    endTime: "09:00 AM"
  });

  // 📡 Backend URL Configuration
  const BACKEND_URL = "http://localhost:5000/api/classes/timetable";

  // 1. Fetch Timetable Grid From SQLite Database
  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await fetch(BACKEND_URL);
      if (!res.ok) throw new Error("Database connectivity blocked.");
      const data = await res.json();
      setTimetable(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to stream live timetable structural grid.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  // 📤 2. Handle Add New Schedule Slot into DB
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.roomNumber) return;

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSlot, day: selectedDay })
      });

      if (!res.ok) throw new Error("Could not insert classroom parameter into server database.");
      
      // Instant reload from database sync engine
      await fetchTimetable();
      setIsModalOpen(false);
      setNewSlot({ className: "Grade 10-A", subject: "Mathematics", roomNumber: "", startTime: "08:00 AM", endTime: "09:00 AM" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 🗑️ 3. Handle Remove Slot from DB
  const handleRemoveSlot = async (slotId: string) => {
    if (!confirm("Kya aap waqai yeh period schedule se delete karna chahte hain?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/${slotId}`, { 
        method: "DELETE" 
      });
      if (!res.ok) throw new Error("Deletion processing runtime control crash.");
      
      // Instant UI re-sync
      await fetchTimetable(); 
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Find slots for currently active view tab
  const activeDaySlots = useMemo(() => {
    return timetable.find(d => d.day === selectedDay)?.slots || [];
  }, [timetable, selectedDay]);

  // Loading Screen Template
  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-500 tracking-wide">Syncing Weekly Grid Engine...</p>
      </div>
    );
  }

  // Error Feedback Template
  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center px-4">
        <AlertTriangle className="h-10 w-10 text-rose-500" />
        <h3 className="text-sm font-bold text-slate-800">Timetable Stream Offline</h3>
        <p className="text-xs text-slate-500 max-w-sm">{error}</p>
        <button onClick={fetchTimetable} className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">
          Retry Sync
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Top Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Calendar size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Weekly Lecture Scheduler</h1>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
              Live Database Config
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Set up daily class periods, assign location hubs, and structure your workload distribution.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={16} className="mr-2" />
          Schedule New Period
        </button>
      </div>

      {/* Day Selector Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl max-w-2xl">
        {timetable.map((d) => {
          const isSelected = selectedDay === d.day;
          return (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`flex-1 min-w-[80px] text-center py-2 text-xs font-bold rounded-lg transition-all ${
                isSelected 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/40" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {d.day}
              <span className={`block text-[10px] font-semibold mt-0.5 ${isSelected ? "text-emerald-600" : "text-slate-400"}`}>
                {d.slots.length} Periods
              </span>
            </button>
          );
        })}
      </div>

      {/* TIME GRID TIMELINE LAYOUT */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          Slots Matrix for {selectedDay}
        </h3>

        {activeDaySlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Clock size={32} className="text-slate-300 stroke-[1.5]" />
            <p className="mt-2 text-sm font-semibold text-slate-500">No lectures scheduled for this day.</p>
            <p className="text-xs text-slate-400 mt-0.5">Click 'Schedule New Period' to fill this slot.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 pl-6 space-y-6 ml-3">
            {activeDaySlots.map((slot) => (
              <div key={slot.id} className="relative group bg-slate-50/60 hover:bg-emerald-50/10 border border-slate-200/50 hover:border-emerald-200/40 rounded-xl p-4 transition-all">
                
                {/* Timeline Bullet Anchor */}
                <div className="absolute -left-[33px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-emerald-500 bg-white shadow-sm group-hover:bg-emerald-500 transition-colors" />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
                    {/* Time Window block */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 min-w-[140px]">
                      <Clock size={14} className="text-slate-400" />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>

                    {/* Class & Subject Core Stack */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{slot.subject}</span>
                        <span className="inline-flex items-center rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                          {slot.className}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mt-1">
                        <MapPin size={12} />
                        <span>Allocated Hub: <span className="font-semibold text-slate-600 font-mono">{slot.roomNumber}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Controls Action Buttons */}
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="rounded-lg p-2 text-slate-400 bg-white border border-slate-200 hover:text-rose-600 hover:bg-rose-50/50 transition-all"
                      title="Delete Period"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE PERIOD DIALOG MODAL LAYOUT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 animate-in zoom-in-95 duration-150 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-emerald-600" /> Lock Period Slot ({selectedDay})
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Target Class</label>
                  <select 
                    value={newSlot.className}
                    onChange={(e) => setNewSlot({...newSlot, className: e.target.value})}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-bold text-slate-700 outline-none bg-white focus:border-emerald-500"
                  >
                    {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Course Subject</label>
                  <select 
                    value={newSlot.subject}
                    onChange={(e) => setNewSlot({...newSlot, subject: e.target.value})}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-bold text-slate-700 outline-none bg-white focus:border-emerald-500"
                  >
                    {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Room Number Allocation</label>
                <input
                  type="text"
                  required
                  value={newSlot.roomNumber}
                  onChange={(e) => setNewSlot({...newSlot, roomNumber: e.target.value})}
                  placeholder="e.g. R-105, Lab-02"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Start Time Window</label>
                  <input
                    type="text"
                    required
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                    placeholder="e.g. 08:30 AM"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">End Time Window</label>
                  <input
                    type="text"
                    required
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                    placeholder="e.g. 09:30 AM"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Dismiss
                </button>
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
                  Publish to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}