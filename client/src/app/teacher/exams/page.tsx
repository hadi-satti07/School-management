"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Award,
  BookOpen,
  Search,
  Save,
  TrendingUp,
  Percent,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

// --- Types ---
interface StudentGrade {
  id: string;
  rollNumber: string;
  name: string;
  fatherName: string;
  obtainedMarks: number; 
}

interface ExamConfig {
  title: string;
  subject: string;
  classGroup: string;
  totalMarks: number;
}

export default function TeacherExamsPage() {
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [examInfo, setExamInfo] = useState<ExamConfig>({
    title: "Mid-Term Examination",
    subject: "Mathematics",
    classGroup: "Grade 10-A",
    totalMarks: 100
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback targets extracted from classGroup metadata parsing
  const targetClass = "Grade 10";
  const targetSection = "A";
  const API_BASE = "http://localhost:5000/api";

  // 1. Fetch live students matching parameters and format into Exam schema Matrix
  const loadExamRosterSheet = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/students`, { cache: "no-store" });
      if (!res.ok) throw new Error("Database query channel blocked.");
      const allStudents = await res.json();

      if (Array.isArray(allStudents)) {
        // String split evaluation ("Grade 10-A" matching breakdown)
        const matchedStudents = allStudents.filter((std: any) => {
          if (!std.subject) return false;
          const splitParts = std.subject.split("-");
          const stdClassName = (splitParts[0] || "").trim().toLowerCase();
          const stdSection = (splitParts[1] || "").trim().toLowerCase();
          
          return stdClassName === targetClass.toLowerCase() && stdSection === targetSection.toLowerCase();
        });

        // Map into core interactive component UI interface
        const formattedExamRoster: StudentGrade[] = matchedStudents.map((std: any, index: number) => ({
          id: std.id || String(index),
          rollNumber: std.pinCode ? `R-${std.pinCode}` : `10A-0${index + 1}`,
          name: std.name || "Unknown Student",
          fatherName: std.phone ? `Contact: ${std.phone}` : "N/A", 
          obtainedMarks: 0 // Reset marks initially or fetch from a grades table if available
        }));

        setStudents(formattedExamRoster);
      }
    } catch (err) {
      console.error("Error setting up exam matrix:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamRosterSheet();
  }, []);

  // Helper utility to dynamically compute Grade & Status
  const computeMetrics = (obtained: number, total: number) => {
    const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";

    return {
      percentage,
      grade,
      isPassed: percentage >= 40 // 40% Passing Threshold
    };
  };

  // Handle live marks input mutations safely
  const handleMarksChange = (id: string, value: string) => {
    setIsSaved(false);
    const parsedValue = value === "" ? 0 : Math.min(Number(value), examInfo.totalMarks);
    
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, obtainedMarks: parsedValue } : s))
    );
  };

  // Filter roster by search keys
  const filteredStudents = useMemo(() => {
    return students.filter(s =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fatherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Exam-level Aggregated Insights
  const analytics = useMemo(() => {
    if (students.length === 0) return { avgScore: 0, passRate: 0, highestScore: 0 };
    
    const totalObtained = students.reduce((acc, s) => acc + s.obtainedMarks, 0);
    const avgObtained = totalObtained / students.length;
    const avgPercent = Math.round((avgObtained / examInfo.totalMarks) * 100);
    
    const passedCount = students.filter(s => (s.obtainedMarks / examInfo.totalMarks) >= 0.4).length;
    const passRate = Math.round((passedCount / students.length) * 100);
    
    const highest = Math.max(...students.map(s => s.obtainedMarks), 0);

    return {
      avgScore: avgPercent,
      passRate,
      highestScore: highest
    };
  }, [students, examInfo.totalMarks]);

  // 📤 Post Exam Scores Dataset back to Backend Endpoint
  const handleCommitMarksheet = async () => {
    try {
      const payload = {
        examTitle: examInfo.title,
        totalMarks: examInfo.totalMarks,
        classGroup: examInfo.classGroup,
        scores: students.map(s => ({ studentId: s.id, marks: s.obtainedMarks }))
      };

      const res = await fetch(`${API_BASE}/exams/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      alert("Database persistence failure: " + err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-400 tracking-wider">Compiling Dynamic Marksheet Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Top Header Row */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Award size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Exam Grading Matrix</h1>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
              {examInfo.classGroup}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Configure assessment targets, perform real-time score evaluations, and log raw data.
          </p>
        </div>

        <button 
          onClick={handleCommitMarksheet}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:-translate-y-0.5"
        >
          <Save size={16} className="mr-2" />
          Commit Marksheet
        </button>
      </div>

      {/* Exam Meta Configuration Row Block */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Assessment Title</label>
          <input 
            type="text" 
            value={examInfo.title}
            onChange={(e) => setExamInfo({...examInfo, title: e.target.value})}
            className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Subject Scope</label>
          <input 
            type="text" 
            value={examInfo.subject}
            disabled
            className="w-full mt-1 bg-slate-100/60 border border-slate-200/40 rounded-lg p-2 text-xs font-bold text-slate-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Assigned Roster</label>
          <input 
            type="text" 
            value={examInfo.classGroup}
            disabled
            className="w-full mt-1 bg-slate-100/60 border border-slate-200/40 rounded-lg p-2 text-xs font-bold text-slate-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Marks Cap</label>
          <input 
            type="number" 
            value={examInfo.totalMarks}
            onChange={(e) => setExamInfo({...examInfo, totalMarks: Number(e.target.value) || 100})}
            className="w-full mt-1 bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Live Stream Performance Analytics Summary Widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Average Score</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">{analytics.avgScore}%</div>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Percent size={18} /></div>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Roster Passing Rate</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">{analytics.passRate}%</div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={18} /></div>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highest Secured Marks</div>
            <div className="text-2xl font-bold text-indigo-600 mt-0.5">
              {analytics.highestScore} <span className="text-xs text-slate-400 font-medium">/ {examInfo.totalMarks}</span>
            </div>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg"><BookOpen size={18} /></div>
        </div>
      </div>

      {/* Search Filter Sub-panel bar */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Filter student or father name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-700 outline-none transition-all focus:border-emerald-500"
        />
      </div>

      {/* Commit Status Feedback Banner */}
      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600" /> Transferred assessment sheets cleanly to registry caches.
        </div>
      )}

      {/* Main Interactive Student Grade Evaluation Table Sheet */}
      <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              Is class filter parameters ke mutabik koi student data nahi mila.
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-4 w-[140px]">Roll Number</th>
                  <th className="px-6 py-4">Student Identity</th>
                  <th className="px-6 py-4 w-[160px]">Obtained Score</th>
                  <th className="px-6 py-4 w-[120px] text-center">Percentage</th>
                  <th className="px-6 py-4 w-[100px] text-center">Grade</th>
                  <th className="px-6 py-4 w-[140px] text-center">Verdict Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const { percentage, grade, isPassed } = computeMetrics(student.obtainedMarks, examInfo.totalMarks);
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600 bg-slate-50/40">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-slate-800">{student.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">{student.fatherName}</div>
                        </div>
                      </td>
                      {/* Live Score Input field column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            max={examInfo.totalMarks}
                            min={0}
                            value={student.obtainedMarks}
                            onChange={(e) => handleMarksChange(student.id, e.target.value)}
                            className="w-20 rounded-lg border border-slate-200 p-1.5 text-center text-xs font-bold text-slate-800 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-xs font-semibold text-slate-400">/ {examInfo.totalMarks}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-xs text-slate-600">
                        {percentage}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex h-7 w-9 items-center justify-center rounded-lg text-xs font-extrabold ${
                          isPassed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                          isPassed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {isPassed ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {isPassed ? "Passed" : "Failed"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}