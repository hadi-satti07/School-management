"use client";

import React, { useMemo } from "react";
import { FileSpreadsheet, Award, Percent, ChevronRight, GraduationCap } from "lucide-react";
// Reusable Atoms/Molecules Imports
import MetricCard from "@/components/common/MetricCard";
import StatusBadge from "@/components/common/StatusBadge";

// --- Types ---
interface SubjectGradeReport {
  id: string;
  subjectName: string;
  teacherName: string;
  obtainedMarks: number;
  totalMarks: number;
}

// --- Mock Synced Report Card Data ---
const reportCardData: SubjectGradeReport[] = [
  { id: "g-1", subjectName: "Mathematics", teacherName: "Mr. Anwar Abbas", obtainedMarks: 85, totalMarks: 100 },
  { id: "g-2", subjectName: "Advanced Algebra", teacherName: "Mr. Anwar Abbas", obtainedMarks: 92, totalMarks: 100 },
  { id: "g-3", subjectName: "English Literature", teacherName: "Ms. Sana Khan", obtainedMarks: 74, totalMarks: 100 },
  { id: "g-4", subjectName: "Physics", teacherName: "Dr. Kamran", obtainedMarks: 65, totalMarks: 100 },
  { id: "g-5", subjectName: "Computer Science", teacherName: "Sir Junaid", obtainedMarks: 88, totalMarks: 100 },
];

export default function StudentGradesPage() {
  
  // Dynamic Score Analytics Matrix
  const overallAnalytics = useMemo(() => {
    if (reportCardData.length === 0) return { totalObtained: 0, totalMax: 0, finalPercentage: 0, finalGPA: "0.0" };
    
    const totalObtained = reportCardData.reduce((acc, curr) => acc + curr.obtainedMarks, 0);
    const totalMax = reportCardData.reduce((acc, curr) => acc + curr.totalMarks, 0);
    const finalPercentage = Math.round((totalObtained / totalMax) * 100);
    
    // Calculate simulated GPA map
    let finalGPA = "F";
    if (finalPercentage >= 90) finalGPA = "4.0 (A+)";
    else if (finalPercentage >= 80) finalGPA = "3.7 (A)";
    else if (finalPercentage >= 70) finalGPA = "3.3 (B)";
    else if (finalPercentage >= 60) finalGPA = "2.7 (C)";
    else if (finalPercentage >= 50) finalGPA = "2.0 (D)";

    return {
      totalObtained,
      totalMax,
      finalPercentage,
      finalGPA
    };
  }, []);

  // Utility to map percentages into crisp custom color code rows
  const getSubjectMetrics = (obtained: number, total: number) => {
    const percentage = Math.round((obtained / total) * 100);
    let grade = "F";
    let isPassed = percentage >= 40;

    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";

    return { percentage, grade, isPassed };
  };

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Top Main Page Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <FileSpreadsheet size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Report Card</h1>
          <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-700/10">
            Mid-Term Results
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Review your finalized performance score tracking, relative subject grades, and aggregated GPA evaluation.
        </p>
      </div>

      {/* REUSABLE METRIC CARDS ROW PANEL (Imported from components/common) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="Aggregated Cumulative Percentage"
          value={`${overallAnalytics.finalPercentage}%`}
          subtext={`Secured ${overallAnalytics.totalObtained} out of ${overallAnalytics.totalMax}`}
          icon={Percent}
          iconBgColor="bg-violet-50"
          iconColor="text-violet-600"
        />
        <MetricCard
          title="Calculated Session GPA"
          value={overallAnalytics.finalGPA}
          subtext="Based on certified evaluation matrices"
          icon={Award}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <MetricCard
          title="Promotion Verdict"
          value="Passed"
          subtext="Clear for next session backlogs"
          icon={GraduationCap}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* MAIN ACADEMIC MARKSHEET EVALUATION SHEET TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Subject-Wise Score Distribution
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50/40 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-4">Course Identity / Faculty</th>
                <th className="px-6 py-4 w-[180px] text-center">Marks Score Bundle</th>
                <th className="px-6 py-4 w-[140px] text-center">Percentage</th>
                <th className="px-6 py-4 w-[120px] text-center">Letter Grade</th>
                <th className="px-6 py-4 w-[140px] text-center">Verdict Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportCardData.map((report) => {
                const { percentage, grade, isPassed } = getSubjectMetrics(report.obtainedMarks, report.totalMarks);
                
                return (
                  <tr key={report.id} className="hover:bg-slate-50/20 transition-colors group">
                    {/* Course Identity Details */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          {report.subjectName}
                          <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">Faculty: {report.teacherName}</div>
                      </div>
                    </td>

                    {/* Marks Frame Column */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 font-mono">
                        <span>{report.obtainedMarks}</span>
                        <span className="text-slate-400 font-normal">/</span>
                        <span className="text-slate-400">{report.totalMarks}</span>
                      </div>
                    </td>

                    {/* Pure Percentage Display */}
                    <td className="px-6 py-4 text-center font-mono font-bold text-xs text-slate-600">
                      {percentage}%
                    </td>

                    {/* Custom Letter Grade Indicator */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex h-7 w-9 items-center justify-center rounded-lg text-xs font-extrabold shadow-sm ${
                        isPassed ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {grade}
                      </span>
                    </td>

                    {/* Reusable UI Atomic StatusBadge Component */}
                    <td className="px-6 py-4 text-center">
                      {isPassed ? (
                        <StatusBadge variant="success" label="Passed" />
                      ) : (
                        <StatusBadge variant="danger" label="Failed" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}