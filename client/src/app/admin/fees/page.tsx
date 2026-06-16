"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Layers,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Check,
  DollarSign,
  UserCheck
} from "lucide-react";

// --- Types ---
interface StudentFee {
  id: string;
  rollNumber: string;
  name: string;
  amount: number;
  status: "paid" | "unpaid";
  paymentDate?: string;
}

interface ClassFeeSummary {
  id: string;
  className: string;
  section: string;
  totalStudents: number;
  paidCount: number;
  unpaidCount: number;
  monthlyFee: number;
  students: StudentFee[];
}

// --- Mock Data with Nested Students ---
const initialClassesData: ClassFeeSummary[] = [
  {
    id: "c1",
    className: "Grade 10",
    section: "A",
    totalStudents: 5,
    paidCount: 3,
    unpaidCount: 2,
    monthlyFee: 150,
    students: [
      { id: "s1", rollNumber: "10A-01", name: "Alice Johnson", amount: 150, status: "paid", paymentDate: "2026-06-01" },
      { id: "s2", rollNumber: "10A-02", name: "Asam Bilal", amount: 150, status: "unpaid" },
      { id: "s3", rollNumber: "10A-03", name: "Zainab Fatima", amount: 150, status: "paid", paymentDate: "2026-06-02" },
      { id: "s4", rollNumber: "10A-04", name: "Hamza Ali", amount: 150, status: "unpaid" },
      { id: "s5", rollNumber: "10A-05", name: "Michael Smith", amount: 150, status: "paid", paymentDate: "2026-05-28" },
    ]
  },
  {
    id: "c2",
    className: "Grade 9",
    section: "B",
    totalStudents: 4,
    paidCount: 2,
    unpaidCount: 2,
    monthlyFee: 140,
    students: [
      { id: "s6", rollNumber: "09B-01", name: "Omer Khan", amount: 140, status: "paid", paymentDate: "2026-06-01" },
      { id: "s7", rollNumber: "09B-02", name: "Sana Ahmed", amount: 140, status: "unpaid" },
      { id: "s8", rollNumber: "09B-03", name: "Dawood Ibrahim", amount: 140, status: "unpaid" },
      { id: "s9", rollNumber: "09B-04", name: "Ayesha Siddiqua", amount: 140, status: "paid", paymentDate: "2026-06-03" },
    ]
  },
  {
    id: "c3",
    className: "Grade 11",
    section: "A",
    totalStudents: 3,
    paidCount: 1,
    unpaidCount: 2,
    monthlyFee: 180,
    students: [
      { id: "s10", rollNumber: "11A-01", name: "Sophia Williams", amount: 180, status: "unpaid" },
      { id: "s11", rollNumber: "11A-02", name: "Liam Davis", amount: 180, status: "paid", paymentDate: "2026-05-30" },
      { id: "s12", rollNumber: "11A-03", name: "James Brown", amount: 180, status: "unpaid" },
    ]
  }
];

export default function FeesPage() {
  const [classes, setClasses] = useState<ClassFeeSummary[]>(initialClassesData);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Find currently selected class
  const currentClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // Toggle Fee Status Handler (Check/Uncheck)
  // Toggle Fee Status Handler (Check/Uncheck)
  const handleToggleFeeStatus = (studentId: string) => {
    if (!selectedClassId) return;

    setClasses(prevClasses =>
      prevClasses.map(cls => {
        if (cls.id !== selectedClassId) return cls;

        const updatedStudents = cls.students.map(student => {
          if (student.id !== studentId) return student;
          
          const newStatus: "paid" | "unpaid" = student.status === "paid" ? "unpaid" : "paid";
          return {
            ...student,
            status: newStatus,
            paymentDate: newStatus === "paid" ? new Date().toISOString().split('T')[0] : undefined
          };
        });

        // Recalculate paid/unpaid counts for the summary card
        const paidCount = updatedStudents.filter(s => s.status === "paid").length;
        const unpaidCount = updatedStudents.length - paidCount;

        return {
          ...cls,
          students: updatedStudents,
          paidCount,
          unpaidCount
        };
      })
    );
  };

  // Filtered Classes for search
  const filteredClasses = useMemo(() => {
    return classes.filter(c => 
      `${c.className} ${c.section}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classes, searchQuery]);

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Header section */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <DollarSign size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fee Counter Collection</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Select any class to manage and check-off student monthly tuition payments instantly.
        </p>
      </div>

      {/* VIEW 1: ALL CLASSES LIST */}
      {!selectedClassId ? (
        <div className="space-y-4">
          {/* Search Bar for Classes */}
          <div className="relative max-w-md bg-white rounded-xl shadow-sm border border-slate-200/60 p-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search class (e.g. Grade 10)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-transparent py-2 pl-10 pr-4 text-sm text-slate-700 outline-none"
            />
          </div>

          {/* Classes Table Grid */}
          <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-4">Class & Section</th>
                  <th className="px-6 py-4">Monthly Tuition Fee</th>
                  <th className="px-6 py-4">Total Strength</th>
                  <th className="px-6 py-4 text-emerald-600">Paid Status</th>
                  <th className="px-6 py-4 text-rose-500">Unpaid Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.map((cls) => (
                  <tr 
                    key={cls.id} 
                    onClick={() => setSelectedClassId(cls.id)}
                    className="cursor-pointer transition-colors hover:bg-indigo-50/20 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <Layers size={16} />
                        </div>
                        <span className="font-semibold text-slate-800">{cls.className} - {cls.section}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      ${cls.monthlyFee}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Users size={14} /> {cls.totalStudents} Students
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                        {cls.paidCount} Cleared
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold border ${
                        cls.unpaidCount > 0 
                          ? "bg-rose-50 text-rose-700 border-rose-100" 
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {cls.unpaidCount} Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all group-hover:border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white">
                        Open Roster <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        
        // VIEW 2: DRILL-DOWN STUDENTS FEE STATUS FOR THE SELECTED CLASS
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Sub-header Navigation */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-100/80 p-3 rounded-xl border border-slate-200/50">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedClassId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {currentClass?.className} - {currentClass?.section} <span className="text-slate-400 font-normal">| Student List</span>
                </h2>
                <p className="text-xs text-slate-500">Click checkboxes to mark fee as paid or unpaid instantly.</p>
              </div>
            </div>

            {/* Micro Stats for Current Class */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600">Total: {currentClass?.totalStudents}</span>
              <span className="bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 text-emerald-700">Paid: {currentClass?.paidCount}</span>
              <span className="bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100 text-rose-700">Pending: {currentClass?.unpaidCount}</span>
            </div>
          </div>

          {/* Students Roster Fee Grid Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                <tr>
                  <th className="w-12 px-6 py-4 text-center">Fee Paid?</th>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Fee Due</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">Collection Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentClass?.students.map((student) => {
                  const isPaid = student.status === "paid";
                  return (
                    <tr 
                      key={student.id} 
                      className={`transition-colors duration-150 ${isPaid ? "bg-emerald-50/15" : "hover:bg-slate-50/60"}`}
                    >
                      {/* Checkbox Collector Control */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeeStatus(student.id)}
                          className={`mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition-all ${
                            isPaid 
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-100" 
                              : "bg-white border-slate-300 hover:border-indigo-500"
                          }`}
                        >
                          {isPaid && <Check size={14} className="stroke-[3]" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        ${student.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
                            : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10"
                        }`}>
                          {isPaid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-400">
                        {student.paymentDate ? student.paymentDate : <span className="italic text-slate-300">Not Paid Yet</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Back Help Button */}
          <div className="flex justify-start">
            <button
              onClick={() => setSelectedClassId(null)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft size={12} /> Back to Class List
            </button>
          </div>

        </div>
      )}
    </div>
  );
}