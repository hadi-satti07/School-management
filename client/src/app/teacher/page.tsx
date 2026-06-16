"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Calendar, CheckSquare, Clock, TrendingUp, 
  AlertTriangle, ArrowRight, Award, UserPlus, Loader2
} from "lucide-react";

// 🌟 CONFIG: API base URL
const API_BASE = "http://localhost:5000/api";

interface DashboardData {
  stats: { totalStudents: string; activeClasses: string; todayLectures: string; classAvgProgress: string; };
  roadmap: Array<{ id: string; time: string; subject: string; class: string; room: string; status: string; }>;
  alerts: Array<{ id: string; type: string; message: string; time: string; }>;
}

export default function TeacherDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Dynamic Data Fetching based on Assigned Class
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Retrieve assigned class from storage
      const assignedClass = localStorage.getItem("userClass") || "Grade 10-A";
      
      const res = await fetch(`${API_BASE}/teacher/dashboard-data?class=${encodeURIComponent(assignedClass)}`);
      
      if (!res.ok) throw new Error("Failed to sync with school database");
      
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      <p className="text-xs font-bold text-slate-500 uppercase">Syncing Class Data...</p>
    </div>
  );

  return (
    <div className="space-y-6 text-slate-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-5">
        <div>
          <h1 className="text-2xl font-black">Control Deck</h1>
          <p className="text-sm text-slate-500">Live analytics for your assigned classroom.</p>
        </div>
        <Link href="/teacher/attendance" className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
          Mark Attendance
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { name: "Total Students", value: data?.stats.totalStudents || "0", icon: Users },
          { name: "Lectures Today", value: data?.stats.todayLectures || "0", icon: Calendar },
          { name: "Class Progress", value: data?.stats.classAvgProgress || "0%", icon: TrendingUp },
          { name: "Status", value: "Active", icon: CheckSquare },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <stat.icon className="text-emerald-600 mb-2" size={20} />
            <p className="text-xs font-bold text-slate-400 uppercase">{stat.name}</p>
            <p className="text-xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Roadmap */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-black mb-4">Today's Lecture Roadmap</h3>
        <div className="space-y-3">
          {data?.roadmap.map((period) => (
            <div key={period.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-bold">{period.subject}</p>
                <p className="text-xs text-slate-500">{period.time} | Room: {period.room}</p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                {period.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}