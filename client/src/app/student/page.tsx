"use client";

import React from "react";
import Link from "next/link";
import {
  CheckSquare,
  Calendar,
  FileSpreadsheet,
  CreditCard,
  Clock,
  Sparkles,
  ArrowRight,
  Bookmark,
  AlertCircle,
  Megaphone
} from "lucide-react";

export default function StudentDashboardPage() {
  // Fake Connected Synchronized Data for Student Scope
  const studentMetrics = [
    { name: "My Attendance Rate", value: "92%", description: "Safe (Minimum required 75%)", icon: CheckSquare, color: "text-violet-600", bg: "bg-violet-50" },
    { name: "Current Class Roster", value: "Grade 10-A", description: "32 Classmates Enrolled", icon: Bookmark, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Latest Exam GPA", value: "3.7 / 4.0", description: "Based on Mid-Term Matrix", icon: FileSpreadsheet, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Fee Status Account", value: "Paid", description: "June Invoice Cleared", icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  // Today's Classroom Timeline Roadmap (Synchronized with Teacher's Schedule)
  const todayClasses = [
    { id: 1, time: "08:00 AM - 09:00 AM", subject: "Mathematics", teacher: "Mr. Anwar Abbas", room: "R-101", status: "Over" },
    { id: 2, time: "10:30 AM - 11:30 AM", subject: "Advanced Algebra", teacher: "Mr. Anwar Abbas", room: "R-202", status: "Active Now" },
    { id: 3, time: "12:00 PM - 01:00 PM", subject: "Statistics", teacher: "Mr. Anwar Abbas", room: "Lab-01", status: "Upcoming" },
  ];

  // Broadcast Desk / Notice Board Announcements
  const announcements = [
    { id: 1, tag: "Exam", message: "Final submission date for Mathematics assignment project portfolio is Friday.", time: "1 day ago" },
    { id: 2, tag: "Event", message: "Sports week selections will begin next Monday during the zero period context.", time: "3 days ago" },
  ];

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Top Hero Welcome Row Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        {/* Abstract Background Visuals */}
        <div className="absolute right-[-20px] top-[-20px] h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-[10%] bottom-[-30px] h-32 w-32 rounded-full bg-violet-400/20 blur-xl" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-violet-200 border border-white/10">
            <Sparkles size={10} className="text-amber-300 animate-pulse" /> Academic Session Active
          </div>
          <h1 className="text-2xl font-black tracking-tight">Salaam & Welcome Back, Zubair! 👋</h1>
          <p className="text-xs text-violet-100 font-medium max-w-xl leading-relaxed">
            Your performance index is looking sharp this week. Make sure to review your advanced algebra lecture sheets before the active slot ends.
          </p>
        </div>
      </div>

      {/* 4-Column Summary Insight Widgets Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {studentMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{metric.name}</span>
                <div className={`rounded-lg p-2 ${metric.bg} ${metric.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold tracking-tight text-slate-800">{metric.value}</span>
                <span className="block text-xs font-medium text-slate-400 mt-0.5">{metric.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Split Matrix Layout Container */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* LEFT & CENTER columns: Class Timeline Schedule Grid */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-violet-600" /> My Today's Lecture Queue
            </h3>
            <Link href="/student/timetable" className="text-xs font-bold text-violet-600 hover:text-violet-700 inline-flex items-center gap-0.5">
              View Calendar <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {todayClasses.map((lecture) => (
              <div 
                key={lecture.id} 
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all ${
                  lecture.status === "Over"
                    ? "bg-slate-50/60 border-slate-200/40 opacity-60"
                    : lecture.status === "Active Now"
                    ? "bg-violet-50/10 border-violet-500/30 ring-1 ring-violet-500/10 shadow-sm shadow-violet-500/5 animate-pulse"
                    : "bg-white border-slate-200/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-lg p-2 text-xs font-bold font-mono text-center min-w-[70px] ${
                    lecture.status === "Over" ? "bg-slate-100 text-slate-400" : "bg-white border border-slate-200 text-slate-700"
                  }`}>
                    {lecture.time.split(" ")[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800">{lecture.subject}</h4>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                        {lecture.room}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Instructor: <span className="font-semibold text-slate-600">{lecture.teacher}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-2 sm:mt-0 flex justify-end">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    lecture.status === "Over"
                      ? "bg-slate-100 text-slate-500"
                      : lecture.status === "Active Now"
                      ? "bg-violet-100 text-violet-800"
                      : "bg-blue-50 text-blue-700"
                  }`}>
                    {lecture.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR COLUMN: Broadcast Desk / Announcements */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
            <Megaphone size={16} className="text-violet-500" /> Institute Broadcast Desk
          </h3>

          <div className="space-y-3 flex-1">
            {announcements.map((item) => (
              <div key={item.id} className="p-3.5 bg-slate-50/70 border border-slate-200/50 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                    item.tag === "Exam" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}>
                    {item.tag}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {item.message}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Informational Bottom Tip */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="rounded-xl bg-violet-50 border border-violet-100 p-3 flex gap-2 text-violet-800 text-xs font-semibold">
              <AlertCircle size={16} className="text-violet-500 shrink-0 mt-0.5" />
              <div>
                <span>Need leaves processing?</span>
                <p className="text-[11px] text-violet-500 font-medium mt-0.5">Contact administration desks to submit medical backlog vouchers.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}


