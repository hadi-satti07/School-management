"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Loader2, 
  AlertCircle, 
  GraduationCap, 
  Sparkles,
  Phone,
  Settings,
  Mail
} from "lucide-react";

export default function MainAuthPage() {
  const router = useRouter();
  
  // Core Interface States
  const [isLoginView, setIsLoginView] = useState(true); 
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "admin">("student");
  
  // Form State Containers
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState(""); // Email ya PinCode
  const [password, setPassword] = useState("");     // Password ya Phone Number
  const [classGroup, setClassGroup] = useState("Grade 10-A"); 
  
  // Status Feedback States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const API_BASE = "http://localhost:5000/api";

  // 🔄 1. Auto Session Persistence Check (Role-Based Redirect)
  useEffect(() => {
    const cachedRole = localStorage.getItem("userRole");
    const cachedId = localStorage.getItem("userId");

    if (cachedRole && cachedId) {
      if (cachedRole === "admin") {
        router.push("/admin/dashboard"); // ✨ Redirect changed to Admin Dashboard
      } else if (cachedRole === "teacher") {
        router.push("/teacher/attendance");
      } else {
        router.push("/");
      }
    } else {
      setCheckingSession(false);
    }
  }, [router]);

  // 📤 2. Consolidated Submission Handler
  const handleAuthSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLoginView ? `${API_BASE}/login` : `${API_BASE}/signup`;
    
    const payload = isLoginView 
      ? { identifier, password }
      : {
          name,
          role: selectedRole,
          ...(selectedRole === "student" 
            ? { pinCode: identifier, phone: password, subject: classGroup }
            : { email: identifier, password: password } // Admin & Teacher use Email/Pass
          )
        };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication baseline failure.");
      }

      // 💾 Cache verification credentials securely
      localStorage.setItem("userRole", data.role || selectedRole);
      localStorage.setItem("userId", data.user?.id || "temp-id");
      localStorage.setItem("userName", data.user?.name || name);
      if (data.user?.subject || classGroup) {
        localStorage.setItem("userClass", data.user?.subject || classGroup);
      }

      // 🔀 Global Dispatcher Redirect Logic
      const finalRole = data.role || selectedRole;
      if (finalRole === "admin") {
        router.push("/admin/dashboard"); // ✨ Redirect changed to Admin Dashboard
      } else if (finalRole === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/student/dashboard");
      }

    } catch (err: any) {
      setError(err.message || "Backend database validation pipeline failure.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthView = () => {
    setIsLoginView(!isLoginView);
    setError("");
    setIdentifier("");
    setPassword("");
    setName("");
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 text-center">IBN-E-ADAM<br/>Verifying Secure Session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md space-y-7 bg-white p-8 rounded-3xl border border-slate-200/10 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
            <ShieldCheck size={26} />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
            {isLoginView ? "System Secure Login" : "Initialize Master Account"}
          </h2>
          <p className="mt-1 text-xs text-slate-400 font-bold uppercase tracking-wider">
            IBN-e-ADAM School Management System
          </p>
        </div>

        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/40">
          <button type="button" onClick={() => { if(!isLoginView) toggleAuthView(); }} className={`py-2 text-xs font-bold rounded-lg transition-all ${isLoginView ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
            Sign In
          </button>
          <button type="button" onClick={() => { if(isLoginView) toggleAuthView(); }} className={`py-2 text-xs font-bold rounded-lg transition-all ${!isLoginView ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
            Register
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800 animate-in fade-in duration-200">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleAuthSubmission}>
          
          {/* REGISTER VIEW ROLE PICKER */}
          {!isLoginView && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Account Role Definition</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <button type="button" onClick={() => setSelectedRole("student")} className={`p-2 rounded-lg border text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${selectedRole === "student" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <GraduationCap size={14} /> Student
                  </button>
                  <button type="button" onClick={() => setSelectedRole("teacher")} className={`p-2 rounded-lg border text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${selectedRole === "teacher" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <Sparkles size={14} /> Teacher
                  </button>
                  <button type="button" onClick={() => setSelectedRole("admin")} className={`p-2 rounded-lg border text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${selectedRole === "admin" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <Settings size={14} /> Admin
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Full Identity Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name..." className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white" />
                </div>
              </div>

              {selectedRole === "student" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Class Allocation</label>
                  <select value={classGroup} onChange={(e) => setClassGroup(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none cursor-pointer">
                    <option>Grade 10-A</option>
                    <option>Grade 10-B</option>
                    <option>Grade 9-A</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* CREDENTIALS SECTION */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              {(!isLoginView && selectedRole === "student") ? "Assign Roll PinCode" : (selectedRole === "admin" || selectedRole === "teacher" ? "Official Email Address" : "Email / Student Access Pin")}
            </label>
            <div className="relative mt-1">
              {(selectedRole === "admin" || selectedRole === "teacher") ? (
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              ) : (
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              )}
              <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={isLoginView ? "Email ya Student PinCode..." : (selectedRole === "student" ? "e.g., 1234" : "admin@school.com")} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              {(!isLoginView && selectedRole === "student") ? "Verify Contact Phone" : "System Password"}
            </label>
            <div className="relative mt-1">
              {(!isLoginView && selectedRole === "student") ? (
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              ) : (
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              )}
              <input type={(!isLoginView && selectedRole === "student") ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={(!isLoginView && selectedRole === "student") ? "e.g., 03001234567" : "••••••••"} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-3 inline-flex items-center justify-center rounded-xl bg-slate-950 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? (
              <><Loader2 size={16} className="animate-spin mr-2 text-emerald-400" /> Authenticating...</>
            ) : (
              isLoginView ? "Sign In to System" : `Register as ${selectedRole.toUpperCase()}`
            )}
          </button>
        </form>

      </div>
    </div>
  );
}