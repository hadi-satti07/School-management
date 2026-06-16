"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Users,
  GraduationCap,
  UserPlus,
  BookOpen,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  X,
  SlidersHorizontal,
  FolderMinus
} from "lucide-react";

// --- Types ---
interface StudentProgress {
  academics: number;    // Marks/Exams basis
  attendance: number;   // Regularity basis
  behaviour: number;    // Class participation/discipline basis
}

interface TeacherStudent {
  id: string;
  rollNumber: string;
  name: string;
  guardianName: string;
  contact: string;
  progress: StudentProgress;
  overallStatus: "Excellent" | "Average" | "Needs Attention";
}

export default function TeacherStudentsPage() {
  // 🌟 Real Data Management State
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState("");

  // 🌟 UPGRADE: Teacher ki dynamic class state mein store karne ke liye
  const [teacherClass, setTeacherClass] = useState("Grade 10-A"); // Default fallback

  // Form State for Adding New Student
  const [newStudent, setNewStudent] = useState({
    name: "",
    guardianName: "",
    contact: "",
    academics: 75,
    attendance: 85,
    behaviour: 80,
  });

  // 📥 1. DATABASE SE DATA FETCH KARNE KA PIPELINE
  // 📥 1. DATABASE SE DATA FETCH KARNE KA PIPELINE
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("👤 Login User Data from LocalStorage:", userData);

      // 🌟 FIX HERE: 'subject' ki bajaye 'userClass' use karein jo localstorage mein aa raha hai
      const myClass = userData.userClass || "Grade 10-A"; 
      
      setTeacherClass(myClass); // State update taake UI par sahi class nazar aaye

      const res = await fetch(`http://localhost:5000/api/students/class/${encodeURIComponent(myClass)}`);
      const data = await res.json();
      
      if (data.success) {
        setStudents(data.students);
      } else {
        setError(data.message || "Failed to fetch roster.");
      }
    } catch (err: any) {
      setError("Server engine down or connection timed out.");
    } finally {
      setLoading(false);
    }
  };
  // Page load hote hi data chalayen
  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    return students.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Handle Form Submit (Real Database Insertion POST Request)
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.guardianName) return;

    try {
      const res = await fetch("http://localhost:5000/api/students/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newStudent.name,
          guardianName: newStudent.guardianName,
          contact: newStudent.contact || "N/A",
          academics: Number(newStudent.academics),
          attendance: Number(newStudent.attendance),
          behaviour: Number(newStudent.behaviour),
          classLabel: teacherClass // 🌟 UPGRADE: Ab dynamic current teacher class auto submit hogi
        }),
      });

      const data = await res.json();

      if (data.success) {
        fetchStudents(); // Fresh copy database load
        setIsModalOpen(false);
        setNewStudent({ name: "", guardianName: "", contact: "", academics: 75, attendance: 85, behaviour: 80 });
      } else {
        alert("Database Matrix Blocked: " + data.message);
      }
    } catch (err) {
      alert("Error sending record payload to database.");
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <GraduationCap size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Classroom Roster</h1>
            {/* 🌟 UPGRADE: UI par absolute string ke bajaye dynamic label print hoga */}
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
              Class: {teacherClass}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage your assigned students, admit new batch entries, and evaluate continuous metrics.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0"
        >
          <UserPlus size={16} className="mr-2" />
          Admit New Student
        </button>
      </div>

      {/* Error / Alert Bar */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Criteria Breakdown Informative Widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={18} /></div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Performance</div>
            <div className="text-sm font-bold text-slate-700 mt-0.5">Exams & Class Quizzes</div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg"><Clock size={18} /></div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Weight</div>
            <div className="text-sm font-bold text-slate-700 mt-0.5">Regularity & Portal Check-ins</div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><Award size={18} /></div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Behavioural Analytics</div>
            <div className="text-sm font-bold text-slate-700 mt-0.5">Discipline & Participation</div>
          </div>
        </div>
      </div>

      {/* Filter Options Control Panel */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search student by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100/80 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Student Management Grid Data Matrix */}
      <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full"></div>
              <p className="text-xs font-medium">Connecting to database engine...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Users size={32} className="text-slate-300 mb-2" />
              <p className="text-sm font-semibold">No students found matching current records.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Academic Rating</th>
                  <th className="px-6 py-4">Attendance Metric</th>
                  <th className="px-6 py-4">Discipline/Behaviour</th>
                  <th className="px-6 py-4 text-center">Calculated Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600 bg-slate-50/50">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-800">{student.name}</div>
                        <div className="text-xs text-slate-400 font-medium">G: {student.guardianName} • {student.contact}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 w-8">{student.progress?.academics || 0}%</span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: `${student.progress?.academics || 0}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 w-8">{student.progress?.attendance || 0}%</span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full" style={{ width: `${student.progress?.attendance || 0}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 w-8">{student.progress?.behaviour || 0}%</span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: `${student.progress?.behaviour || 0}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        student.overallStatus === "Excellent"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
                          : student.overallStatus === "Average"
                          ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10"
                          : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10"
                      }`}>
                        {student.overallStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADMIT NEW STUDENT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 animate-in zoom-in-95 duration-150 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
              {/* 🌟 UPGRADE: Modal header description bhi dynamic show hogi */}
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-600" /> Admission Desk ({teacherClass})
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Student Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    placeholder="e.g. Asam Bilal"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Guardian Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.guardianName}
                    onChange={(e) => setNewStudent({...newStudent, guardianName: e.target.value})}
                    placeholder="Father/Mother name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Contact Number</label>
                <input
                  type="text"
                  value={newStudent.contact}
                  onChange={(e) => setNewStudent({...newStudent, contact: e.target.value})}
                  placeholder="e.g. 0300-XXXXXXX"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Set Baseline Performance Parameters</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Academics %</label>
                    <input type="number" max="100" min="0" value={newStudent.academics} onChange={(e) => setNewStudent({...newStudent, academics: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 p-2 text-sm font-semibold outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Attendance %</label>
                    <input type="number" max="100" min="0" value={newStudent.attendance} onChange={(e) => setNewStudent({...newStudent, attendance: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 p-2 text-sm font-semibold outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Behaviour %</label>
                    <input type="number" max="100" min="0" value={newStudent.behaviour} onChange={(e) => setNewStudent({...newStudent, behaviour: Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 p-2 text-sm font-semibold outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
                  Register & Roll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}