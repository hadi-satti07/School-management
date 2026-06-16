"use client";

import React from "react";
import { X, Printer, Check, ShieldCheck, Landmark } from "lucide-react";

interface ChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    month: string;
    studentName: string;
    rollNumber: string;
    fatherName: string;
    classGroup: string;
    amount: number;
    dueDate: string;
  };
}

export default function ChallanModal({ isOpen, onClose, invoice }: ChallanModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Control Bar */}
        <div className="bg-slate-900 px-6 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Landmark size={16} className="text-violet-400" />
            <span className="text-xs font-bold tracking-wide uppercase">System Generated Bank Voucher</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Print Challan"
            >
              <Printer size={16} />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* --- ACTUAL CHALLAN PRINTABLE BODY --- */}
        <div className="p-6 space-y-6 text-slate-800 id-printable-area">
          
          {/* Logo & Bank Header */}
          <div className="flex justify-between items-start border-b-2 border-dashed border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">EduPortal International School</h2>
              <p className="text-[10px] font-bold text-violet-600 uppercase font-mono tracking-wider">Allied Bank Ltd - Fee Account: 0010045928401</p>
            </div>
            <div className="text-right">
              <div className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-black font-mono text-slate-700">
                CHALLAN NO: {invoice.id}
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Issue Date: 2026-06-01</p>
            </div>
          </div>

          {/* Student Bio Meta Grid */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 bg-slate-50 p-4 rounded-xl text-xs border border-slate-100">
            <div><span className="text-slate-400 font-medium">Student Name:</span> <strong className="text-slate-800 font-bold ml-1">{invoice.studentName}</strong></div>
            <div><span className="text-slate-400 font-medium">Roll Number:</span> <strong className="text-slate-700 font-mono font-bold ml-1">{invoice.rollNumber}</strong></div>
            <div><span className="text-slate-400 font-medium">Father Name:</span> <strong className="text-slate-800 font-semibold ml-1">{invoice.fatherName}</strong></div>
            <div><span className="text-slate-400 font-medium">Class Group:</span> <strong className="text-slate-800 font-bold ml-1">{invoice.classGroup}</strong></div>
          </div>

          {/* Fee Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Account Description</th>
                  <th className="px-4 py-2.5 text-right w-[150px]">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="px-4 py-3">Monthly Tuition Fee Component ({invoice.month})</td>
                  <td className="px-4 py-3 text-right font-mono">Rs {invoice.amount.toLocaleString()}.00</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Information Technology & Lab Charges</td>
                  <td className="px-4 py-3 text-right font-mono">Rs 0.00</td>
                </tr>
                <tr className="bg-slate-50/50 text-slate-900 font-bold border-t border-slate-200">
                  <td className="px-4 py-3 text-xs uppercase tracking-wide">Total Payable on or Before Due Date</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-violet-700 font-black">
                    Rs {invoice.amount.toLocaleString()}.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Instructions & Validations Disclaimer */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-4">
            <div className="space-y-0.5 max-w-md">
              <p className="text-rose-600 font-bold uppercase flex items-center gap-1">
                ⚠️ Due Date: {invoice.dueDate}
              </p>
              <p>Late payment will trigger a surcharge penalty backlog of Rs. 200 automatically.</p>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200/50">
              <ShieldCheck size={14} className="text-emerald-600" /> Secure Token Verified
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}