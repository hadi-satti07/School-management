"use client";

import React, { useMemo } from "react";
import { CreditCard, Download, CheckCircle, AlertCircle, Receipt, History } from "lucide-react";
// Reusable Components Imports
import MetricCard from "@/components/common/MetricCard";
import StatusBadge from "@/components/common/StatusBadge";

// --- Types ---
interface FeeInvoice {
  id: string;
  month: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  fine: number;
  status: "Paid" | "Unpaid";
  paymentDate?: string;
}

// --- Mock Student Fee Record ---
const feeHistoryData: FeeInvoice[] = [
  { id: "inv-06", month: "June 2026", issueDate: "2026-06-01", dueDate: "2026-06-10", amount: 6500, fine: 0, status: "Paid", paymentDate: "2026-06-02" },
  { id: "inv-05", month: "May 2026", issueDate: "2026-05-01", dueDate: "2026-05-10", amount: 6500, fine: 0, status: "Paid", paymentDate: "2026-05-05" },
  { id: "inv-04", month: "April 2026", issueDate: "2026-04-01", dueDate: "2026-04-10", amount: 6500, fine: 200, status: "Paid", paymentDate: "2026-04-12" }, // Paid with fine backlog
  { id: "inv-03", month: "March 2026", issueDate: "2026-03-01", dueDate: "2026-03-10", amount: 6500, fine: 0, status: "Paid", paymentDate: "2026-03-08" },
];

export default function StudentFeesPage() {
  
  // Calculate total fee tracking metrics
  const financialMetrics = useMemo(() => {
    const totalPaidSum = feeHistoryData
      .filter(inv => inv.status === "Paid")
      .reduce((acc, curr) => acc + curr.amount + curr.fine, 0);

    const pendingInvoices = feeHistoryData.filter(inv => inv.status === "Unpaid");
    const pendingSum = pendingInvoices.reduce((acc, curr) => acc + curr.amount, 0);
    const nextDue = pendingInvoices.length > 0 ? pendingInvoices[0].dueDate : "No Pending Dues";

    return {
      totalPaidSum,
      pendingSum,
      nextDue
    };
  }, []);

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Top Header Row Block */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <CreditCard size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fee Ledger & Challans</h1>
          <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-700/10">
            Billing Active
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Monitor your school financial records, download monthly receipt duplicates, and check outstanding dynamic fines.
        </p>
      </div>

      {/* METRIC REUSABLE WIDGETS LAYOUT */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="Outstanding Payable Balance"
          value={`PKR ${financialMetrics.pendingSum.toLocaleString()}`}
          subtext={financialMetrics.pendingSum > 0 ? `Payable up to: ${financialMetrics.nextDue}` : "Account full cleared"}
          icon={AlertCircle}
          iconBgColor={financialMetrics.pendingSum > 0 ? "bg-amber-50" : "bg-slate-100"}
          iconColor={financialMetrics.pendingSum > 0 ? "text-amber-600" : "text-slate-400"}
        />
        <MetricCard
          title="Total Formatted Paid Sum"
          value={`PKR ${financialMetrics.totalPaidSum.toLocaleString()}`}
          subtext="Session financial history logs"
          icon={CheckCircle}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <MetricCard
          title="Active Payment Method"
          value="Bank Challan"
          subtext="On-counter or mobile banking utility"
          icon={Receipt}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* MAIN BILLING HISTORICAL LEDGER SHEET */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <History size={16} className="text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Statement Billing History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50/40 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-4">Billing Month</th>
                <th className="px-6 py-4">Issue / Due Timeline</th>
                <th className="px-6 py-4 text-right">Base Amount</th>
                <th className="px-6 py-4 text-right">Late Fine surcharge</th>
                <th className="px-6 py-4 text-center w-[130px]">Status Badge</th>
                <th className="px-6 py-4 text-center w-[150px]">Voucher Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feeHistoryData.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50/20 transition-colors">
                  {/* Month Information */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-slate-800">{invoice.month}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-semibold mt-0.5">ID: {invoice.id}</div>
                    </div>
                  </td>

                  {/* Dates Frame Layout */}
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-0.5">
                      <p className="text-slate-500 font-medium">Issued: <span className="text-slate-700 font-mono">{invoice.issueDate}</span></p>
                      <p className="text-slate-400 font-medium">Deadline: <span className="text-slate-700 font-mono font-semibold">{invoice.dueDate}</span></p>
                    </div>
                  </td>

                  {/* Pricing Matrix Values */}
                  <td className="px-6 py-4 text-right font-mono text-xs font-bold text-slate-700">
                    Rs {invoice.amount.toLocaleString()}/-
                  </td>
                  <td className={`px-6 py-4 text-right font-mono text-xs font-bold ${invoice.fine > 0 ? "text-rose-600" : "text-slate-400"}`}>
                    Rs {invoice.fine.toLocaleString()}/-
                  </td>

                  {/* Status Indicator (Using Atom Component) */}
                  <td className="px-6 py-4 text-center">
                    {invoice.status === "Paid" ? (
                      <StatusBadge variant="success" label="Cleared" />
                    ) : (
                      <StatusBadge variant="danger" label="Overdue" />
                    )}
                  </td>

                  {/* Download Trigger Action */}
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => alert(`Triggering download stream for invoice token: ${invoice.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      <Download size={13} />
                      Challan PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}