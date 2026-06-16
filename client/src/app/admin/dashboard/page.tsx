"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import {
  GraduationCap,
  Users,
  FileText,
  Plus,
  Download,
  X,
  ArrowRight,
  Pencil,
  Trash2
} from "lucide-react";
import { API_BASE_URL } from "../../../../config/api"; 

interface StudentRecord {
  id: string;
  name: string;
  subject: string;
  email: string;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "exam" | "holiday" | "meeting";
}

export default function DashboardPage() {
  const router = useRouter();
  
  // States
  const [recentStudents, setRecentStudents] = useState<StudentRecord[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [statsData, setStatsData] = useState({ totalStudents: "0", totalTeachers: "0", pendingInvoices: "$0" });
  const [loading, setLoading] = useState(true);

  // Event Modal States (Add + Edit combo modal)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null); // Null ka matlab Add mode, ID ka matlab Edit mode
  const [eventForm, setEventForm] = useState({ title: "", date: "", time: "", type: "exam" });

  const syncDashboard = async () => {
    try {
      setLoading(true);
      const studentsRes = await fetch(`${API_BASE_URL}/api/students`);
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setRecentStudents(Array.isArray(studentsData) ? studentsData.slice(-4).reverse() : []);
      }

      const statsRes = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStatsData({
          totalStudents: sData.totalStudents.toString(),
          totalTeachers: sData.totalTeachers.toString(),
          pendingInvoices: sData.pendingInvoices,
        });
        setUpcomingEvents(sData.events || []);
      }
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncDashboard();
  }, []);

  // 📥 REPORT GENERATOR
  const handleGenerateReport = () => {
    if (recentStudents.length === 0) return alert("Data will be empty");
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Class,Email\n";
    recentStudents.forEach((s) => { csvContent += `${s.id.slice(0,8)},${s.name},${s.subject},${s.email}\n`; });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `School_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 📅 SUBMIT EVENT (Handles both Create and Update)
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEventId 
        ? `${API_BASE_URL}/api/dashboard/events/${editingEventId}` // Edit URL
        : `${API_BASE_URL}/api/dashboard/events`;                  // Add URL
        
      const method = editingEventId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });

      if (res.ok) {
        setIsEventModalOpen(false);
        setEditingEventId(null);
        setEventForm({ title: "", date: "", time: "", type: "exam" });
        syncDashboard(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE EVENT FUNCTION
  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/events/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        syncDashboard(); // UI refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✏️ TRIGGER EDIT MODE
  const startEditEvent = (event: EventItem) => {
    setEditingEventId(event.id);
    setEventForm({ title: event.title, date: event.date, time: event.time, type: event.type });
    setIsEventModalOpen(true);
  };

  const stats = [
    { title: "Total Students", value: statsData.totalStudents, icon: GraduationCap, colorClass: "bg-blue-50 text-blue-600" },
    { title: "Total Teachers", value: statsData.totalTeachers, icon: Users, colorClass: "bg-violet-50 text-violet-600" },
    { title: "Pending Invoices", value: statsData.pendingInvoices, icon: FileText, colorClass: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-900">
      
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="mt-1 text-slate-500">Track school performance, students, and events in real-time.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={handleGenerateReport} className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
            <Download size={16} className="mr-2 text-slate-500" /> Generate Report
          </button>
          <button onClick={() => router.push("/admin/students")} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-indigo-700">
            <Plus size={16} className="mr-2" /> Add New Student
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.colorClass}`}><stat.icon size={20} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Recent Admissions */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-full">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent Admissions</h2>
              <button onClick={() => router.push("/admin/students")} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="p-6 divide-y divide-slate-100">
              {loading ? (
                <div className="text-center text-slate-400 py-4 animate-pulse">Loading DB records...</div>
              ) : recentStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">{student.name ? student.name.charAt(0) : "S"}</div>
                    <div>
                      <span className="block text-sm font-semibold text-slate-800">{student.name}</span>
                      <span className="block text-xs text-slate-400">{student.email}</span>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 font-medium">{student.subject || "Not Assigned"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Events Timeline WITH EDIT/DELETE ACTIONS */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-semibold text-slate-900">Upcoming Events</h2>
              <button onClick={() => { setEditingEventId(null); setEventForm({title:"", date:"", time:"", type:"exam"}); setIsEventModalOpen(true); }} className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center">
                <Plus size={14} className="mr-0.5" /> Add
              </button>
            </div>
            <div className="space-y-4 relative pl-4 border-l border-slate-100">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="relative pb-2 group">
                  {/* Action overlay triggers on hover */}
                  <div className="absolute right-0 top-0 hidden group-hover:flex items-center gap-1.5 bg-white pl-2">
                    <button onClick={() => startEditEvent(event)} className="text-slate-400 hover:text-indigo-600 p-1 rounded transition-colors" title="Edit Event">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteEvent(event.id)} className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors" title="Delete Event">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-indigo-500 block">{event.date} • {event.time}</span>
                  <span className="text-sm font-semibold text-slate-800 block mr-12">{event.title}</span>
                  <span className="text-[9px] uppercase font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 w-fit block mt-1">{event.type}</span>
                </div>
              ))}
              {upcomingEvents.length === 0 && <div className="text-xs text-slate-400 py-4">No events scheduled.</div>}
            </div>
          </div>
        </div>

      </div>

      {/* 🟢 COMBO MODAL (ADD & EDIT) */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <form onSubmit={handleEventSubmit} className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-900">{editingEventId ? "Modify Event Details" : "Schedule New Event"}</h3>
              <button type="button" onClick={() => setIsEventModalOpen(false)}><X size={16} /></button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block">Event Title</label>
              <input type="text" required placeholder="e.g., Parent-Teacher Meeting" value={eventForm.title} onChange={(e)=>setEventForm({...eventForm, title: e.target.value})} className="w-full mt-1 border px-3 py-1.5 rounded-lg text-sm outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-500 block">Date</label>
                <input type="text" required placeholder="e.g., Oct 30" value={eventForm.date} onChange={(e)=>setEventForm({...eventForm, date: e.target.value})} className="w-full mt-1 border px-3 py-1.5 rounded-lg text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block">Time</label>
                <input type="text" required placeholder="e.g., 02:00 PM" value={eventForm.time} onChange={(e)=>setEventForm({...eventForm, time: e.target.value})} className="w-full mt-1 border px-3 py-1.5 rounded-lg text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block">Event Type</label>
              <select value={eventForm.type} onChange={(e)=>setEventForm({...eventForm, type: e.target.value as any})} className="w-full mt-1 border px-3 py-1.5 rounded-lg text-sm bg-white outline-none">
                <option value="exam">Exam</option>
                <option value="holiday">Holiday</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg text-sm hover:bg-indigo-700">
              {editingEventId ? "Update Event Changes" : "Save Event to Database"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}