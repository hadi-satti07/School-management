"use client";

import React, { useState, useMemo } from "react";
import { Calendar, Clock, MapPin, User, BookOpen, Clock3 } from "lucide-react";
// Reusable Component Import
import StatusBadge from "@/components/common/StatusBadge";

// --- Types ---
interface StudentScheduleSlot {
  id: string;
  subject: string;
  teacher: string;
  roomNumber: string;
  startTime: string;
  endTime: string;
  isLive?: boolean; // To simulate current running period
  isOver?: boolean; // To simulate completed period
}

interface StudentDaySchedule {
  day: string;
  slots: StudentScheduleSlot[];
}

// --- Synchronized Mock Data with Teacher's Timetable ---
const studentWeeklyTimetable: StudentDaySchedule[] = [
  {
    day: "Monday",
    slots: [
      { id: "s-slot-1", subject: "Mathematics", teacher: "Mr. Anwar Abbas", roomNumber: "R-101", startTime: "08:00 AM", endTime: "09:00 AM", isOver: true },
      { id: "s-slot-2", subject: "Advanced Algebra", teacher: "Mr. Anwar Abbas", roomNumber: "R-202", startTime: "10:30 AM", endTime: "11:30 AM", isLive: true },
      { id: "s-slot-3", subject: "English Literature", teacher: "Ms. Sana Khan", roomNumber: "R-104", startTime: "12:00 PM", endTime: "01:00 PM" },
    ]
  },
  {
    day: "Tuesday",
    slots: [
      { id: "s-slot-4", subject: "Mathematics", teacher: "Mr. Anwar Abbas", roomNumber: "R-101", startTime: "09:00 AM", endTime: "10:00 AM" },
      { id: "s-slot-5", subject: "Physics Lab", teacher: "Dr. Kamran", roomNumber: "Lab-01", startTime: "12:00 PM", endTime: "01:00 PM" },
    ]
  },
  {
    day: "Wednesday",
    slots: [
      { id: "s-slot-6", subject: "Advanced Algebra", teacher: "Mr. Anwar Abbas", roomNumber: "R-202", startTime: "08:00 AM", endTime: "09:00 AM" },
      { id: "s-slot-7", subject: "Mathematics", teacher: "Mr. Anwar Abbas", roomNumber: "R-101", startTime: "10:30 AM", endTime: "11:30 AM" },
    ]
  },
  {
    day: "Thursday",
    slots: [
      { id: "s-slot-8", subject: "Chemistry Lecture", teacher: "Mrs. Bilquis", roomNumber: "R-105", startTime: "09:00 AM", endTime: "10:00 AM" },
      { id: "s-slot-9", subject: "Computer Science", teacher: "Sir Junaid", roomNumber: "Lab-03", startTime: "11:00 AM", endTime: "12:00 PM" },
    ]
  },
  {
    day: "Friday",
    slots: [
      { id: "s-slot-10", subject: "Mathematics", teacher: "Mr. Anwar Abbas", roomNumber: "R-101", startTime: "08:00 AM", endTime: "09:15 AM" },
    ]
  }
];

export default function StudentTimetablePage() {
  const [selectedDay, setSelectedDay] = useState("Monday");

  // Find lectures for the selected active tab
  const activeDaySlots = useMemo(() => {
    return studentWeeklyTimetable.find(d => d.day === selectedDay)?.slots || [];
  }, [selectedDay]);

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Top Header Section */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Calendar size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Class Timetable Matrix</h1>
          <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-700/10">
            Weekly Schedule
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Track your daily academic lectures, assigned locations, and faculty instructor distribution.
        </p>
      </div>

      {/* Weekdays Tabs Navigation Selector */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl max-w-2xl">
        {studentWeeklyTimetable.map((d) => {
          const isSelected = selectedDay === d.day;
          return (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`flex-1 min-w-[85px] text-center py-2.5 text-xs font-bold rounded-lg transition-all ${
                isSelected 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/40" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {d.day}
              <span className={`block text-[10px] font-semibold mt-0.5 ${isSelected ? "text-violet-600" : "text-slate-400"}`}>
                {d.slots.length} Lectures
              </span>
            </button>
          );
        })}
      </div>

      {/* TIMELINE TIMETABLE MATRIX CARD LAYOUT */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          Lectures for {selectedDay}
        </h3>

        {activeDaySlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Clock3 size={32} className="text-slate-300 stroke-[1.5]" />
            <p className="mt-2 text-sm font-semibold text-slate-500">No classes scheduled for this day.</p>
            <p className="text-xs text-slate-400 mt-0.5">Enjoy your free time or utilize it for project backlogs.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 pl-6 space-y-6 ml-3">
            {activeDaySlots.map((slot) => (
              <div 
                key={slot.id} 
                className={`relative group border rounded-xl p-4 transition-all ${
                  slot.isLive 
                    ? "bg-violet-50/10 border-violet-200 ring-1 ring-violet-500/10 shadow-sm shadow-violet-500/5 animate-in fade-in zoom-in-98 duration-200" 
                    : slot.isOver 
                    ? "bg-slate-50/60 border-slate-200/40 opacity-60" 
                    : "bg-white border-slate-200/60 hover:bg-slate-50/40"
                }`}
              >
                {/* Timeline Circle Node Anchor */}
                <div className={`absolute -left-[33px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 bg-white shadow-sm transition-colors ${
                  slot.isLive ? "border-violet-500 bg-violet-500" : "border-slate-300 group-hover:border-slate-400"
                }`} />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-8">
                    
                    {/* Lecture Time Slots Frame */}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 min-w-[150px]">
                      <Clock size={14} className={slot.isLive ? "text-violet-500" : "text-slate-400"} />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>

                    {/* Subject Detail Column Stack */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-800">{slot.subject}</span>
                        {/* Instructor Detail */}
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                          <User size={12} className="text-slate-400" /> {slot.teacher}
                        </span>
                      </div>
                      
                      {/* Location Data */}
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <MapPin size={12} />
                        <span>Room Location: <span className="font-semibold text-slate-600 font-mono">{slot.roomNumber}</span></span>
                      </div>
                    </div>

                  </div>

                  {/* Right Status Badge Indicator (Using our Reusable Component) */}
                  <div className="flex justify-end sm:mt-0">
                    {slot.isLive ? (
                      <StatusBadge variant="info" label="Active Now" />
                    ) : slot.isOver ? (
                      <StatusBadge variant="warning" label="Completed" />
                    ) : (
                      <StatusBadge variant="success" label="Scheduled" />
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}