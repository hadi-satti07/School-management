"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  CreditCard,
  ChevronRight
} from "lucide-react";

const teacherNavItems = [
  { name: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { name: "My Classroom", href: "/teacher/students", icon: Users },
  { name: "Time Table", href: "/teacher/timetable", icon: Calendar },
  { name: "Attendance Roll", href: "/teacher/attendance", icon: CheckSquare },
  { name: "Exam & Grades", href: "/teacher/exams", icon: FileText },
  { name: "Fee Invoicing", href: "/teacher/fees", icon: CreditCard }, 
];

interface TeacherProfile {
  name: string;
  role: string;
  className: string; 
  avatarInitials: string;
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Next.js SSR safe check
    if (typeof window === "undefined") return;

    // 🔍 Session Validation Check
    const storedName = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("userRole");
    const storedClass = localStorage.getItem("userClass");

    // 🚫 KICK GUARD: Agar name ya role missing hai, toh foran root page '/' par kick out karo
    if (!storedName || storedRole !== "teacher") {
      console.warn("🚨 Unauthenticated access detected! Purging session and redirecting to main page...");
      localStorage.clear(); // Saara data fresh clean
      router.replace("/"); // Direct to main page.tsx login setup
      return;
    }

    // 🎓 Active Session verified successfully
    const initials = storedName
      .trim()
      .split(/\s+/)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    setTeacher({
      name: storedName,
      role: storedRole,
      className: storedClass || "General Allocation",
      avatarInitials: initials || "TR"
    });
    
    setLoading(false);
  }, [router]);

  // Dynamic Breadcrumbs Engine
  const getBreadcrumbContext = () => {
    if (pathname === "/teacher") return { current: "Overview Dashboard", parent: "Teacher Suite" };
    const activeItem = teacherNavItems.find(item => item.href !== "/teacher" && pathname.startsWith(item.href));
    return activeItem 
      ? { current: activeItem.name, parent: "Teacher Suite" }
      : { current: "Portal Workspace", parent: "Management" };
  };

  const breadcrumb = getBreadcrumbContext();

  // 🧹 Bulletproof Session Purge & Dynamic Exit to '/'
  const handleSignOut = () => {
    localStorage.clear(); // Complete storage wipe out (sara data fresh)
    router.replace("/"); // Seedha main window par dispatch karega
  };

  // 🛡️ Loading State UI Layer Protection (Bina content flash kiye blank screen protector)
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white font-sans antialiased">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-xs font-bold tracking-wider uppercase text-slate-400">Verifying Active Security Token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 antialiased font-sans">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* --- SIDEBAR COMPONENT --- */}
      <aside className={`fixed bottom-0 top-0 left-0 z-50 w-64 border-r border-slate-800/40 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
          <Link href="/teacher" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <GraduationCap size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wide block">EduPortal</span>
              <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider block">Teacher Suite</span>
            </div>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-800 lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Current Class Context Dynamic Badge */}
        <div className="px-4 py-3 mx-3 my-4 rounded-xl bg-slate-800/40 border border-slate-800/80 flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Room Allocation</div>
            <div className="text-xs font-bold text-white mt-0.5 tracking-wide">
              {teacher?.className}
            </div>
          </div>
        </div>

        {/* Navigation Menus */}
        <nav className="space-y-1 px-3 py-2 flex-1 overflow-y-auto">
          {teacherNavItems.map((item) => {
            const isActive = item.href === "/teacher" ? pathname === "/teacher" : pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15 font-bold translate-x-1"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"} />
                  <span>{item.name}</span>
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/80 bg-slate-950/30">
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-rose-500/5 text-left group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 group-hover:bg-rose-500/10 group-hover:text-rose-500">
              <LogOut size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300 group-hover:text-rose-400">Sign Out</div>
              <div className="text-[10px] text-slate-500 font-medium">Terminate Session</div>
            </div>
          </button>
        </div>
      </aside>

      {/* --- MAIN WRAPPER CONTAINER --- */}
      <div className="flex flex-col lg:pl-64 min-h-screen">
        
        {/* --- NAVBAR / HEADER COMPONENT --- */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white px-4 md:px-6 border-b border-slate-200/80 backdrop-blur-md bg-white/95 shadow-sm">
          
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-50 border border-slate-200 lg:hidden">
              <Menu size={18} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>{breadcrumb.parent}</span>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-800 font-bold tracking-tight">{breadcrumb.current}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
              <Bell size={16} />
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <hr className="h-5 w-px bg-slate-200 mx-1" />

            {/* Profile Dropdown Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 rounded-xl p-1 hover:bg-slate-50 border border-transparent hover:border-slate-200/60 select-none"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-xs font-black text-emerald-700 border border-emerald-200/50">
                  {teacher?.avatarInitials}
                </div>
                <div className="hidden text-left md:block pr-1">
                  <div className="text-xs font-bold text-slate-800 leading-none">
                    {teacher?.name}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">
                    {teacher?.role} Portal
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden md:block" />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-2.5 z-20 w-52 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                      Account Operations
                    </div>
                    <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 group">
                      <Settings size={14} className="text-slate-400" /> 
                      <span>Account Settings</span>
                    </button>
                    <button onClick={handleSignOut} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                      <LogOut size={14} /> 
                      <span>Log Out Workspace</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

      </div>
    </div>
  );
}