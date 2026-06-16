  "use client";

  import React, { useState } from "react";
  import Link from "next/link";
  import { usePathname } from "next/navigation";
  import {
    GraduationCap,
    LayoutDashboard,
    Calendar,
    FileSpreadsheet,
    CreditCard,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    User,
    Sparkles
  } from "lucide-react";

  // --- Sidebar Links for Student ---
  const studentNavItems = [
    { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    { name: "Class Timetable", href: "/student/timetable", icon: Calendar },
    { name: "My Report Card", href: "/student/grades", icon: FileSpreadsheet },
    { name: "Fee Ledger", href: "/student/fees", icon: CreditCard },
  ];

  export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Fake Active Student Session Context Data
    const currentStudent = {
      name: "Zubair Ahmed",
      rollNumber: "10A-01",
      classGroup: "Grade 10-A",
      avatar: "ZA",
      houseGroup: "Jinnah House (Red)"
    };

    return (
      <div className="min-h-screen bg-slate-50/50 text-slate-800">
        
        {/* MOBILE SIDEBAR OVERLAY */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* --- SIDEBAR COMPONENT --- */}
        <aside className={`fixed bottom-0 top-0 left-0 z-50 w-64 border-r border-slate-200/80 bg-slate-900 text-slate-300 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          {/* Brand/School Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-600/20">
                <GraduationCap size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-wide block">EduPortal</span>
                <span className="text-[10px] font-bold uppercase text-violet-400 tracking-wider block">Student Desk</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-800 lg:hidden text-slate-400">
              <X size={18} />
            </button>
          </div>

          {/* Current Student Profile Core Card Badge */}
          <div className="px-4 py-3 mx-3 my-4 rounded-xl bg-slate-800/50 border border-slate-800/80 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-400 border border-violet-500/20">
              {currentStudent.avatar}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{currentStudent.name}</div>
              <div className="text-[10px] font-semibold text-slate-400 mt-0.5 font-mono">{currentStudent.rollNumber} • {currentStudent.classGroup}</div>
            </div>
          </div>

          {/* Navigation Routes Mapping */}
          <nav className="space-y-1 px-3 py-2">
            {studentNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                      : "hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  <Icon size={16} className={`transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-violet-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer Account Switcher */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-950/40">
            <button className="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-slate-800/60 transition-colors text-left group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300 group-hover:bg-rose-500/10 group-hover:text-rose-400 transition-colors">
                <LogOut size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-300 group-hover:text-white">Sign Out</div>
                <div className="text-[10px] text-slate-500 font-medium">Clear Session</div>
              </div>
            </button>
          </div>
        </aside>

        {/* --- MAIN MAIN WRAPPER CONTAINER --- */}
        <div className="flex flex-col lg:pl-64 min-h-screen">
          
          {/* --- NAVBAR / HEADER COMPONENT --- */}
          <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white px-4 md:px-6 border-b border-slate-200/80 shadow-sm shadow-slate-100/40">
            
            {/* Mobile Menu Toggle button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-50 border border-slate-200 lg:hidden"
            >
              <Menu size={18} />
            </button>

            {/* Sparkle Motivation Greeting Text (Left side) */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Sparkles size={14} className="text-violet-500 animate-pulse" />
              Keep tracking your progress, <span className="text-slate-800 font-bold">{currentStudent.name}</span>
            </div>

            {/* Controls Right Section */}
            <div className="flex items-center gap-3 ml-auto">
              
              {/* Notification Badge Bell */}
              <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 animate-ping" />
              </button>

              <hr className="h-5 w-px bg-slate-200" />

              {/* Profile Menu Toggle */}
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/60"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-700 border border-violet-200/30">
                    {currentStudent.avatar}
                  </div>
                  <div className="hidden text-left md:block pr-1">
                    <div className="text-xs font-bold text-slate-800 leading-none">{currentStudent.name}</div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5">{currentStudent.houseGroup}</div>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden md:block" />
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 z-20 w-48 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-lg animate-in fade-in slide-in-from-top-1 duration-100">
                      <div className="px-3 py-2 text-xs font-medium text-slate-400 border-b border-slate-100">
                        Identity Portal
                      </div>
                      <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <User size={14} className="text-slate-400" /> View Bio Profile
                      </button>
                      <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                        <LogOut size={14} /> Close Session
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>
          </header>

          {/* --- INJECTED CONTENT PLUG --- */}
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
            {children}
          </main>

        </div>
      </div>
    );
  }



  

  