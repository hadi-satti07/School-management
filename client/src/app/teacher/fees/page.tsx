"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CreditCard, Sparkles, Eye, CheckCircle, Loader2 } from "lucide-react";
import ChallanModal from "@/components/common/ChallanModal";

// --- Types ---
interface StudentInfo {
  id: string;
  rollNumber: string;
  name: string;
  fatherName: string;
  classGroup: string;
}

export default function TeacherFeeAutomationPage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("July 2026");
  const [baseAmount, setBaseAmount] = useState(6500);
  const [isGenerated, setIsGenerated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modal Preview Configurations
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Configuration Configuration fallbacks for parsing match patterns
  const targetClass = "Grade 10";
  const targetSection = "A";
  const API_BASE = "http://localhost:5000/api";

  // 1. Fetch live student metadata and compile for Fee Matrix reconciliation
  const loadFeeRoster = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/students`, { cache: "no-store" });
      if (!res.ok) throw new Error("Data telemetry channel timed out.");
      const allStudents = await res.json();

      if (Array.isArray(allStudents)) {
        // Core tracking subject split matching mechanism
        const matchedStudents = allStudents.filter((std: any) => {
          if (!std.subject) return false;
          const splitParts = std.subject.split("-");
          const stdClassName = (splitParts[0] || "").trim().toLowerCase();
          const stdSection = (splitParts[1] || "").trim().toLowerCase();
          
          return stdClassName === targetClass.toLowerCase() && stdSection === targetSection.toLowerCase();
        });

        // Map backend collection items into clear Student interface properties
        const formattedFeeRoster: StudentInfo[] = matchedStudents.map((std: any, index: number) => ({
          id: std.id || String(index),
          rollNumber: std.pinCode ? `R-${std.pinCode}` : `10A-0${index + 1}`,
          name: std.name || "Unknown Student",
          fatherName: std.phone ? `Contact: ${std.phone}` : "N/A",
          classGroup: `${targetClass}-${targetSection}`
        }));

        setStudents(formattedFeeRoster);
      }
    } catch (err) {
      console.error("Error setting up billing stream:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeRoster();
  }, []);

  // 📤 2. Submit Mass Bulk Invoicing array packages into Cloud Database Engine
  const handleBulkGeneration = async () => {
    try {
      const payload = {
        month: selectedMonth,
        baseAmount: baseAmount,
        invoices: students.map(s => ({
          studentId: s.id,
          rollNumber: s.rollNumber,
          amount: baseAmount,
          dueDate: "2026-07-10" // Standard fallback parameter configuration 
        }))
      };

      // Yahan endpoint match karein jahan aap invoices table sync logs bhejte hain
      const res = await fetch(`${API_BASE}/invoices/bulk-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setIsGenerated(true);
      setTimeout(() => setIsGenerated(false), 4000);
    } catch (err) {
      console.error("Error dispatching bulk vouchers:", err);
    }
  };

  const handleOpenPreview = (student: StudentInfo) => {
    setPreviewData({
      id: `CHL-${student.rollNumber}-26`,
      month: selectedMonth,
      studentName: student.name,
      rollNumber: student.rollNumber,
      fatherName: student.fatherName,
      classGroup: student.classGroup,
      amount: baseAmount,
      dueDate: "2026-07-10"
    });
    setIsPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-400 tracking-wider">Syncing Ledger Registry Accounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CreditCard size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fee Invoicing Automation</h1>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
            {targetClass}-{targetSection} Controls
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Auto-compute monthly session structures, issue mass electronic ledger challans, and sync direct student portals.
        </p>
      </div>

      {/* Auto Generation Engine Parameters Box */}
      <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Target Billing Month</label>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
          >
            <option>July 2026</option>
            <option>August 2026</option>
            <option>September 2026</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Standard Base Tuition Amount</label>
          <input 
            type="number"
            value={baseAmount}
            onChange={(e) => setBaseAmount(Number(e.target.value) || 0)}
            className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 font-mono"
          />
        </div>

        <button 
          onClick={handleBulkGeneration}
          disabled={students.length === 0}
          className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 p-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Sparkles size={14} className="mr-1.5 text-amber-300" /> Auto-Generate & Dispatch All
        </button>
      </div>

      {/* Dispatch Success Alert Panel */}
      {isGenerated && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>Success! {students.length} Customized Invoices securely injected into corresponding Student Portals for {selectedMonth}.</span>
        </div>
      )}

      {/* Classroom Registry Active Overview */}
      <div className="bg-white border border-slate-200/70 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Roster Dispatch Live Matrix</h3>
        </div>
        
        <div className="overflow-x-auto">
          {students.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              Is billing query system mein koi matching data registers nahi mile.
            </div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-3.5">Roll Number</th>
                  <th className="px-6 py-3.5">Student Details</th>
                  <th className="px-6 py-3.5 text-right">Computed Amount</th>
                  <th className="px-6 py-3.5 text-center">Action View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">{student.rollNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{student.name}</div>
                      <div className="text-[10px] text-slate-400">{student.fatherName}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs font-bold text-slate-700">Rs {baseAmount.toLocaleString()}.00</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleOpenPreview(student)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
                      >
                        <Eye size={12} /> Preview Voucher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Shared Portal Voucher Modal Injections */}
      {previewData && (
        <ChallanModal 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)} 
          invoice={previewData} 
        />
      )}

    </div>
  );
}