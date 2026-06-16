"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CheckSquare,
  Users,
  Calendar,
  Search,
  UserCheck,
  UserX,
  AlertCircle,
  Save,
  RefreshCw,
  Loader2
} from "lucide-react";

interface AttendanceStudent {
  id: string;
  rollNumber: string;
  name: string;
  fatherName: string; 
  avatar: string;
  isPresent: boolean;
}

export default function TeacherAttendancePage() {
  const [attendanceList, setAttendanceList] = useState<AttendanceStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configuration - Dynamic mapping parameter fallback for Grade 10-A
  const targetClass = "Grade 10";
  const targetSection = "A";
  const API_BASE = "http://localhost:5000/api/attendance";

  // 1. Fetch Students Roster Matrix on Date/Class Shifts
  const loadAttendanceSheet = async () => {
    try {
      setLoading(true);
      // Direct pure students ki registry hit karein
      const res = await fetch("http://localhost:5000/api/students", { cache: "no-store" });
      if (!res.ok) throw new Error("Backend query stream blocked.");
      const allStudents = await res.json();
      
      if (Array.isArray(allStudents)) {
        // Wahi coupling reconciliation logic jo admin panel mein lagayi thi!
        const matchedStudents = allStudents.filter((std: any) => {
          if (!std.subject) return false;
          const splitParts = std.subject.split("-"); // "Grade 10-A" -> ["Grade 10", "A"]
          const stdClassName = (splitParts[0] || "").trim().toLowerCase();
          const stdSection = (splitParts[1] || "").trim().toLowerCase();
          
          return stdClassName === targetClass.toLowerCase() && stdSection === targetSection.toLowerCase();
        });

        // Backend schema ko AttendanceStudent state mapping ke saath link karein
        const formattedRoster: AttendanceStudent[] = matchedStudents.map((std: any, index: number) => ({
          id: std.id || String(index),
          rollNumber: std.pinCode ? `R-${std.pinCode}` : `R-00${index + 1}`,
          name: std.name || "Unknown Student",
          fatherName: std.phone ? `Contact: ${std.phone}` : "N/A", // user configuration coupling fallback
          avatar: std.name ? std.name.charAt(0).toUpperCase() : "S",
          isPresent: true // Default headcount mark active
        }));

        setAttendanceList(formattedRoster);
      }
    } catch (err) {
      console.error("Error loading roster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceSheet();
  }, [selectedDate]);

  // 🌟 FIX: Optional chaining (?.) use kiya taaki fatherName missing hone par search breakdown na ho
  const filteredStudents = useMemo(() => {
    return attendanceList.filter(s =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fatherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [attendanceList, searchQuery]);

  const totalCount = attendanceList.length;
  const presentCount = attendanceList.filter(s => s.isPresent).length;
  const absentCount = totalCount - presentCount;
  const attendancePercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const handleToggleStatus = (id: string) => {
    setIsSaved(false);
    setAttendanceList(prev =>
      prev.map(s => (s.id === id ? { ...s, isPresent: !s.isPresent } : s))
    );
  };

  const handleMarkAllPresent = () => {
    setIsSaved(false);
    setAttendanceList(prev => prev.map(s => ({ ...s, isPresent: true })));
  };

  const handleResetSheet = () => {
    setIsSaved(false);
    loadAttendanceSheet(); 
  };

  // 📤 3. Post Local Register Sheet Array Into Database Cloud
  const handleSaveAttendance = async () => {
    try {
      const payload = {
        date: selectedDate,
        records: attendanceList.map(s => ({ studentId: s.id, isPresent: s.isPresent }))
      };

      const res = await fetch(`${API_BASE}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Could not commit updates to database.");

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      alert("Error saving registers: " + err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-400 tracking-wider">Syncing Student Registry Logs...</p>
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
              <CheckSquare size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Daily Attendance Roll Call</h1>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
              {targetClass}-{targetSection}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Process morning headcount, edit historical backlogs, and submit authenticated telemetry.
          </p>
        </div>

        {/* Date Selector Input Component */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-xl shadow-sm self-start sm:self-auto">
          <Calendar size={16} className="text-slate-400 ml-1" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setIsSaved(false); }}
            className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
          />
        </div>
      </div>

      {/* Dynamic Summary Widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Strength</div>
          <div className="text-2xl font-bold text-slate-800 mt-1 flex items-center gap-2">
            <Users size={18} className="text-blue-500" /> {totalCount} <span className="text-xs font-semibold text-slate-400">Enrolled</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Count</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 flex items-center gap-2">
            <UserCheck size={18} /> {presentCount} <span className="text-xs font-semibold text-slate-400">Classrooms</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absent Count</div>
          <div className="text-2xl font-bold text-rose-600 mt-1 flex items-center gap-2">
            <UserX size={18} /> {absentCount} <span className="text-xs font-semibold text-slate-400">Left Out</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            {attendancePercentage}%
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
              <div className={`h-full transition-all duration-300 ${attendancePercentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${attendancePercentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions & Utility Search Sub-bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by student or father name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-xs text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white"
          />
        </div>

        {/* Bulk Roster Operations Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleMarkAllPresent}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Mark All Present
          </button>
          <button 
            onClick={handleResetSheet}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50/20"
            title="Reset Sheet"
          >
            <RefreshCw size={14} />
          </button>
          <hr className="hidden sm:block h-5 w-px bg-slate-200 mx-1" />
          <button 
            onClick={handleSaveAttendance}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <Save size={14} className="mr-1.5" /> Save Register Sheet
          </button>
        </div>
      </div>

      {/* Success Save Alert Feedback */}
      {isSaved && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold animate-in fade-in duration-200">
          <AlertCircle size={16} className="text-emerald-600" /> Attendance logs safely committed to cloud database cache registry for {selectedDate}.
        </div>
      )}

      {/* Attendance Roster Interactive Sheet Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              Is group class mein koi active students matching parameters nahi mile.
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-4 w-[160px]">Roll Number</th>
                  <th className="px-6 py-4">Student Identity</th>
                  <th className="px-6 py-4 text-center w-[200px]">Attendance Roll Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600 bg-slate-50/40">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200/40">
                          {student.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{student.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">S/O: {student.fatherName || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleStatus(student.id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                          student.isPresent
                            ? "bg-emerald-500 text-white shadow-emerald-500/10 hover:bg-emerald-600"
                            : "bg-rose-500 text-white shadow-rose-500/10 hover:bg-rose-600"
                        }`}
                      >
                        {student.isPresent ? (
                          <><UserCheck size={14} /> Present</>
                        ) : (
                          <><UserX size={14} /> Absent</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}