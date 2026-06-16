"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  GraduationCap, Search, Plus, SlidersHorizontal, Edit2, 
  Trash2, Eye, ChevronLeft, ChevronRight, CheckCircle2, 
  X, Loader2 
} from "lucide-react";

// 🌟 CONFIG: Dynamic configuration (Yahan se manage karo)
const AVAILABLE_GRADES = ["Grade 8-A", "Grade 9-A", "Grade 10-A", "Grade 11-A", "Grade 12-A"];
const API_BASE = "http://localhost:5000/api/students";

interface DbStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string; 
  role: string;
  pinCode: string;
}

type SortField = "name" | "id" | "subject";
type SortOrder = "asc" | "desc";

export default function StudentsPage() {
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("All"); 
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<DbStudent | null>(null); 
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    assignedClass: AVAILABLE_GRADES[0], 
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("❌ FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStudentId ? `${API_BASE}/${editingStudentId}` : `${API_BASE}/enroll`;
      const method = editingStudentId ? "PUT" : "POST";
      
      const payload = {
        name: formData.name,
        email: formData.email || "",
        phone: formData.phone || "",
        subject: formData.assignedClass
      };

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(editingStudentId ? "Updated! ✨" : "Enrolled! 🎉");
        setIsModalOpen(false);
        setEditingStudentId(null);
        setFormData({ name: "", email: "", phone: "", assignedClass: AVAILABLE_GRADES[0] });
        await fetchStudents(); 
      }
    } catch (error) {
      alert("Database connection failed.");
    }
  };

  const openEditModal = (student: DbStudent) => {
    setEditingStudentId(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      assignedClass: student.subject || AVAILABLE_GRADES[0]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      fetchStudents();
    }
  };

  const processedStudents = useMemo(() => {
    let data = [...students];
    if (selectedGradeFilter !== "All") {
      data = data.filter(s => s.subject === selectedGradeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(s => s.name.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q));
    }
    return data;
  }, [students, searchQuery, selectedGradeFilter]);

  const paginatedStudents = processedStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-5">
        <h1 className="text-2xl font-black">Students Directory</h1>
        <button 
          onClick={() => { setEditingStudentId(null); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold"
        >
          <Plus size={16} className="inline mr-1" /> Enroll Student
        </button>
      </div>

      {/* Filter */}
      <div className="relative">
        <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className="border p-2 rounded-lg text-sm font-semibold flex items-center">
          <SlidersHorizontal size={15} className="mr-2"/> Filter: {selectedGradeFilter}
        </button>
        {showFilterDropdown && (
          <div className="absolute mt-2 bg-white border rounded-xl p-2 w-48 shadow-lg z-50">
            {["All", ...AVAILABLE_GRADES].map(grade => (
              <button key={grade} onClick={() => { setSelectedGradeFilter(grade); setShowFilterDropdown(false); }} className="w-full text-left p-2 hover:bg-slate-50 text-sm">
                {grade}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Class</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedStudents.map((s) => (
              <tr key={s.id}>
                <td className="p-4 font-bold">{s.name}</td>
                <td className="p-4">{s.subject}</td>
                <td className="p-4 text-right">
                  <button onClick={() => openEditModal(s)} className="text-indigo-600 font-bold px-2">Edit</button>
                  <button onClick={() => handleDelete(s.id, s.name)} className="text-rose-600 font-bold px-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h3 className="font-black text-lg">{editingStudentId ? "Edit" : "Enroll"} Student</h3>
            <input required placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" />
            <select value={formData.assignedClass} onChange={(e) => setFormData({...formData, assignedClass: e.target.value})} className="w-full border p-2 rounded">
              {AVAILABLE_GRADES.map(grade => <option key={grade} value={grade}>{grade}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full border py-2 rounded">Cancel</button>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}