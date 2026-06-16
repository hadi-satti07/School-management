"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  SlidersHorizontal,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  UserCheck,
  X,
  AlertCircle,
  Loader2
} from "lucide-react";

interface StudentRoster {
  id: string;
  name: string;
  rollNumber: string;
  gender: "Male" | "Female";
  guardianName: string;
  attendancePercentage: number;
}

interface ClassStream {
  id: string;
  name: string;
  section: string;
  classTeacher: string;
  teacherSubject: string;
  roomNumber: string;
  schedule: string;
  status: "active" | "inactive";
  studentsCount: number;
  studentsList?: StudentRoster[];
}

interface TeacherData {
  id: string;
  name: string;
  subject: string;
  role: string;
}

export default function ClassesManagementPage() {
  const [classesData, setClassesData] = useState<ClassStream[]>([]);
  const [teachers, setTeachers] = useState<TeacherData[]>([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [classForm, setClassForm] = useState({
    name: "Grade 10",
    section: "",
    classTeacher: "",
    teacherSubject: "",
    roomNumber: "",
    schedule: "08:00 AM - 03:00 PM",
    status: "active" as "active" | "inactive"
  });

  const BACKEND_URL = "http://localhost:5000/api/classes";
  const USERS_URL = "http://localhost:5000/api/teachers"; 
  const STUDENTS_URL = "http://localhost:5000/api/students"; // 🎯 Added student alignment api URL

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, usersRes, studentsRes] = await Promise.all([
        fetch(BACKEND_URL, { cache: "no-store" }),
        fetch(USERS_URL, { cache: "no-store" }),
        fetch(STUDENTS_URL, { cache: "no-store" }).catch(() => null) // Safe failover handling
      ]);

      if (!classesRes.ok) throw new Error("Classes data fetch nahi ho saka");
      const rawClassesData = await classesRes.json();
      
      // Load raw active student rows to link counters dynamically
      let loadedStudents: any[] = [];
      if (studentsRes && studentsRes.ok) {
        loadedStudents = await studentsRes.json();
      }
      
      const mappedClasses: ClassStream[] = Array.isArray(rawClassesData) ? rawClassesData.map((cls: any) => {
        const classNameStr = (cls.name || cls.className || "").trim();
        const sectionStr = (cls.section || "").trim();
        
        // 🎯 CRITICAL RECONCILIATION COUPLING:
        // Filter students where frontend student structure format "Grade X-Section" aligns with this current card 
        const matchedStudentsFromDb = loadedStudents.filter((std: any) => {
          if (!std.subject) return false;
          // Split "Grade 10-A" -> Class: "Grade 10", Section: "A"
          const splitParts = std.subject.split("-");
          const stdClassName = (splitParts[0] || "").trim().toLowerCase();
          const stdSection = (splitParts[1] || "").trim().toLowerCase();
          
          return stdClassName === classNameStr.toLowerCase() && stdSection === sectionStr.toLowerCase();
        });

        // Map database records into UI StudentRoster interface shape safely
        const dynamicRoster: StudentRoster[] = matchedStudentsFromDb.map((std: any, index: number) => ({
          id: std.id || String(index),
          name: std.name,
          rollNumber: std.pinCode ? `R-${std.pinCode}` : `R-00${index + 1}`,
          gender: "Male", // Fail-safe default
          guardianName: std.phone || "N/A",
          attendancePercentage: 92 // Demo display mock status metric
        }));

        const directCount = cls.studentsCount !== undefined ? Number(cls.studentsCount) : 0;
        const finalCalculatedCount = dynamicRoster.length > 0 ? dynamicRoster.length : directCount;

        return {
          id: String(cls.id || cls._id || ""),
          name: classNameStr || "Unknown Grade",
          section: sectionStr || "",
          classTeacher: cls.classTeacher || cls.teacher || "Not Assigned",
          teacherSubject: cls.teacherSubject || cls.subject || "General",
          roomNumber: cls.roomNumber || "N/A",
          schedule: cls.schedule || "08:00 AM - 03:00 PM",
          status: (cls.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
          studentsCount: finalCalculatedCount,
          studentsList: dynamicRoster
        };
      }) : [];
      
      setClassesData(mappedClasses);

      if (usersRes.ok) {
        const allUsers = await usersRes.json();
        if (Array.isArray(allUsers)) {
          const teacherUsers = allUsers.filter((user: any) => user && (user.role === "teacher" || user.status));
          setTeachers(teacherUsers);
        }
      }
    } catch (error) {
      console.error("❌ FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredClasses = classesData.filter(cls => {
    const matchesSearch =
      cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.classTeacher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.section?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || cls.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentClass = classesData.find(c => c.id === selectedClassId);

  const openCreateModal = () => {
    setEditingClassId(null);
    setClassForm({
      name: "Grade 10",
      section: "",
      classTeacher: "",
      teacherSubject: "",
      roomNumber: "",
      schedule: "08:00 AM - 03:00 PM",
      status: "active"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cls: ClassStream, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClassId(cls.id);
    setClassForm({
      name: cls.name,
      section: cls.section,
      classTeacher: cls.classTeacher,
      teacherSubject: cls.teacherSubject,
      roomNumber: cls.roomNumber,
      schedule: cls.schedule,
      status: cls.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.classTeacher) {
      alert("Please select a class teacher first!");
      return;
    }

    try {
      setSubmitting(true);
      const url = editingClassId ? `${BACKEND_URL}/${editingClassId}` : BACKEND_URL;
      const method = editingClassId ? "PUT" : "POST";

      const payload = {
        name: classForm.name,
        className: classForm.name,              
        section: classForm.section,
        classTeacher: classForm.classTeacher,
        teacher: classForm.classTeacher,          
        teacherSubject: classForm.teacherSubject,       
        subject: classForm.teacherSubject,       
        roomNumber: classForm.roomNumber,
        schedule: classForm.schedule,
        status: classForm.status
      };

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();

      if (res.ok) {
        await fetchData();
        setIsModalOpen(false);
      } else {
        console.error("❌ BACKEND VALIDATION CRASH DETAILS:", resData);
        alert("Backend database validation configuration failure: " + (typeof resData === 'object' ? JSON.stringify(resData) : resData));
      }
    } catch (error) {
      console.error("❌ SUBMIT ERROR:", error);
      alert("Server schema structure processing failure occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Kya aap waqai is class ko hamesha ke liye delete karna chahte hain?")) {
      try {
        const res = await fetch(`${BACKEND_URL}/${id}`, { method: "DELETE" });
        if (res.ok) {
          setClassesData(prev => prev.filter(c => c.id !== id));
          if (selectedClassId === id) setSelectedClassId(null);
        }
      } catch (error) {
        console.error("❌ DELETE ERROR:", error);
      }
    }
  };

  const handleTeacherChange = (teacherName: string) => {
    const selectedTeacher = teachers.find(t => t.name === teacherName);
    setClassForm({
      ...classForm,
      classTeacher: teacherName,
      teacherSubject: selectedTeacher ? selectedTeacher.subject || "General" : "General"
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 antialiased">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5 border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Academic Streams</h1>
          <p className="text-sm text-slate-500 mt-1">Live Database Connection Active.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          <Plus size={16} /> Setup New Class
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <p className="text-sm font-medium text-slate-500">Database se live classes load ho rahi hain...</p>
        </div>
      ) : !selectedClassId ? (
        <>
          {/* FILTER MATRIX */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-200/80 p-3 rounded-2xl shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search via Grade, Room, Teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-slate-400 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 outline-none cursor-pointer"
              >
                <option value="all">All Operational Status</option>
                <option value="active">Active Streams</option>
                <option value="inactive">Suspended Streams</option>
              </select>
            </div>
          </div>

          {/* GRID CARDS */}
          {filteredClasses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300/80 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold border uppercase tracking-wider ${cls.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-rose-50 text-rose-700 border-rose-200/60'}`}>
                        ● {cls.status}
                      </span>
                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => openEditModal(cls, e)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600"><Edit3 size={15} /></button>
                        <button onClick={(e) => handleDeleteClass(cls.id, e)} className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{cls.name} - {cls.section}</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">Incharge: <span className="text-slate-700 font-bold">{cls.classTeacher}</span> <span className="text-slate-400 font-normal">({cls.teacherSubject})</span></p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-500">
                    <div className="flex items-center gap-1"><MapPin size={13} className="text-slate-400 shrink-0" /><span className="truncate">{cls.roomNumber}</span></div>
                    <div className="flex items-center gap-1"><Clock size={13} className="text-slate-400 shrink-0" /><span className="truncate">{cls.schedule?.split(" - ")[0] || "08:00 AM"}</span></div>
                    
                    {/* 🌟 AUTOMATIC DYNAMIC RECONCILED COUNT */}
                    <div className="flex items-center gap-1 justify-end font-extrabold text-indigo-600">
                      <Users size={13} className="text-indigo-400 shrink-0" />
                      <span>{cls.studentsCount} Studs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-2xl p-12 bg-slate-50/40">
              <AlertCircle className="text-slate-300 h-10 w-10 mb-2" />
              <p className="text-sm text-slate-400 font-medium">Database mein koi class nahi mila. Nayi class add karein!</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* ROSTER DRILL DOWN */}
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedClassId(null)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm"><ArrowLeft size={16} /></button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-800">{currentClass?.name} - {currentClass?.section}</h2>
                    <span className="rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold px-2 py-0.5">Room {currentClass?.roomNumber}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Class Teacher: <span className="font-semibold text-slate-600">{currentClass?.classTeacher}</span> ({currentClass?.teacherSubject})</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <UserCheck size={14} className="text-emerald-500" /> {currentClass?.studentsCount || 0} Students Connected
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                    <tr>
                      <th className="px-6 py-4">Roll No</th>
                      <th className="px-6 py-4">Full Name</th>
                      <th className="px-6 py-4">Gender</th>
                      <th className="px-6 py-4">Guardian Contact</th>
                      <th className="px-6 py-4">Attendance Metrics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentClass?.studentsList && currentClass.studentsList.length > 0 ? (
                      currentClass.studentsList.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{student.rollNumber}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{student.name}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${student.gender === "Male" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-pink-50 text-pink-700 border-pink-100"}`}>
                              {student.gender}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{student.guardianName}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/30">
                                <div className={`h-full rounded-full ${student.attendancePercentage >= 90 ? "bg-emerald-500" : student.attendancePercentage >= 75 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${student.attendancePercentage}%` }} />
                              </div>
                              <span className="text-xs font-bold text-slate-600">{student.attendancePercentage}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="text-center py-6 text-slate-400 text-xs">Is class ke andar abhi koi student roster enrolled nahi hai.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <form onSubmit={handleFormSubmit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border space-y-4 text-sm text-slate-700">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">{editingClassId ? "Modify Class Parameters" : "Setup New Class Stream"}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block">Class Name</label>
                <select value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} className="w-full mt-1 border px-3 py-2 rounded-lg bg-white outline-none">
                  {Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block">Section/Batch</label>
                <input type="text" required placeholder="e.g., A, B" value={classForm.section} onChange={(e) => setClassForm({ ...classForm, section: e.target.value })} className="w-full mt-1 border px-3 py-2 rounded-lg outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block">Assigned Incharge Teacher</label>
              <select
                required
                value={classForm.classTeacher}
                onChange={(e) => handleTeacherChange(e.target.value)}
                className="w-full mt-1 border px-3 py-2 rounded-lg bg-white outline-none focus:border-indigo-500"
              >
                <option value="">Select a Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block">Specialized Subject</label>
                <input type="text" readOnly required placeholder="Select teacher first" value={classForm.teacherSubject} className="w-full mt-1 border px-3 py-2 rounded-lg bg-slate-50 text-slate-500 outline-none cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block">Room Number</label>
                <input type="text" required placeholder="e.g., R-101" value={classForm.roomNumber} onChange={(e) => setClassForm({ ...classForm, roomNumber: e.target.value })} className="w-full mt-1 border px-3 py-2 rounded-lg outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block">Daily Schedule</label>
                <input type="text" required value={classForm.schedule} onChange={(e) => setClassForm({ ...classForm, schedule: e.target.value })} className="w-full mt-1 border px-3 py-2 rounded-lg outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block">Stream Status</label>
                <select value={classForm.status} onChange={(e) => setClassForm({ ...classForm, status: e.target.value as any })} className="w-full mt-1 border px-3 py-2 rounded-lg bg-white outline-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Saving to DB...
                </                >
              ) : editingClassId ? (
                "Commit Changes"
              ) : (
                "Save Stream to Database"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}