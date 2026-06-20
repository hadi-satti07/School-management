"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Plus, SlidersHorizontal, Edit2, 
  Trash2, Eye, X 
} from "lucide-react";

const AVAILABLE_GRADES = ["Grade 8-A", "Grade 9-A", "Grade 10-A", "Grade 11-A", "Grade 12-A"];
const API_BASE = "http://localhost:5000/api/students";

interface DbStudent {
  id: string;
  name: string;
  fatherName: string;
  email: string;
  phone: string;
  subject: string; 
  role: string;
  pinCode: string;
  password: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("All"); 
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState<DbStudent | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
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
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingStudentId ? `${API_BASE}/${editingStudentId}` : `${API_BASE}/enroll`;
    await fetch(url, {
      method: editingStudentId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        fatherName: formData.fatherName,
        phone: formData.phone,
        subject: formData.assignedClass
      }),
    });
    setIsModalOpen(false);
    setEditingStudentId(null);
    setFormData({ name: "", fatherName: "", phone: "", assignedClass: AVAILABLE_GRADES[0] });
    fetchStudents();
  };

  const openEditModal = (s: DbStudent) => {
    setEditingStudentId(s.id);
    setFormData({
      name: s.name,
      fatherName: s.fatherName || "",
      phone: s.phone || "",
      assignedClass: s.subject
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      fetchStudents();
    }
  };

  const filtered = students.filter(s => 
    (selectedGradeFilter === "All" || s.subject === selectedGradeFilter) &&
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center border-b pb-5">
        <h1 className="text-2xl font-black">Students Directory</h1>
        <button onClick={() => { setEditingStudentId(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold">
          <Plus size={16} className="inline mr-1" /> Enroll Student
        </button>
      </div>

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

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
            <tr>
              <th className="p-4 text-left">Student</th>
              <th className="p-4 text-left">Class</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((s) => (
              <tr key={s.id}>
                <td className="p-4 font-bold">{s.name}</td>
                <td className="p-4">{s.subject}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => setViewStudent(s)} className="text-blue-600 p-2 hover:bg-blue-50 rounded"><Eye size={16}/></button>
                  <button onClick={() => openEditModal(s)} className="text-indigo-600 p-2 hover:bg-indigo-50 rounded"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(s.id, s.name)} className="text-rose-600 p-2 hover:bg-rose-50 rounded"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Enroll Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h3 className="font-black text-lg">{editingStudentId ? "Edit" : "Enroll"} Student</h3>
            <input required placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" />
            <input required placeholder="Father Name" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} className="w-full border p-2 rounded" />
            <input required placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded" />
            <select value={formData.assignedClass} onChange={(e) => setFormData({...formData, assignedClass: e.target.value})} className="w-full border p-2 rounded">
              {AVAILABLE_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full border py-2 rounded">Cancel</button>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* View Modal */}
      {viewStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg">Student Details</h3>
              <button onClick={() => setViewStudent(null)}><X size={20}/></button>
            </div>
            <p><strong>Name:</strong> {viewStudent.name}</p>
            <p><strong>Father:</strong> {viewStudent.fatherName}</p>
            <p><strong>Phone:</strong> {viewStudent.phone}</p>
            <div className="bg-slate-100 p-3 rounded-lg border text-xs font-mono">
              <p>Email: {viewStudent.email}</p>
              <p>Pin: {viewStudent.pinCode}</p>
              <p className="text-indigo-600 font-bold">Password: {viewStudent.password}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}