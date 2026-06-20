"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  GraduationCap, LayoutDashboard, Calendar, FileSpreadsheet, 
  CreditCard, LogOut, Menu, Bell, Sparkles 
} from "lucide-react";

const studentNavItems = [
  { name: "Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "Timetable", href: "/student/timetable", icon: Calendar },
  { name: "Grades", href: "/student/grades", icon: FileSpreadsheet },
  { name: "Fees", href: "/student/fees", icon: CreditCard },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State for dynamic student data
  const [student, setStudent] = useState({ name: "Loading...", id: "...", class: "..." });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      router.push("/"); // Redirect if not logged in
      return;
    }

    // Backend se data fetch karein
    fetch(`http://localhost:5000/api/me?id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudent({
            name: data.user.name,
            id: data.user.id,
            class: data.user.subject || "N/A"
          });
        }
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, [router]);

  const handleSignOut = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <aside className={`fixed z-50 w-64 h-full bg-slate-900 transition-all duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl"><GraduationCap className="text-white" /></div>
          <h1 className="text-white font-black text-lg tracking-tight">EduPortal</h1>
        </div>

        {/* Dynamic Profile Section */}
        <div className="mx-4 mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-white font-bold text-sm truncate uppercase">{student.name}</p>
          <p className="text-indigo-300 text-xs font-mono">{student.id} | {student.class}</p>
        </div>

        <nav className="px-4 space-y-2">
          {studentNavItems.map((item) => (
            <Link key={item.name} href={item.href} 
              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all ${
                pathname === item.href ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}>
              <item.icon size={18} /> {item.name}
            </Link>
          ))}
        </nav>

        {/* Sign Out Button Added Back */}
        <div className="absolute bottom-6 w-full px-4">
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 p-3 text-rose-400 hover:bg-slate-800 rounded-xl transition-all">
            <LogOut size={18} /> <span className="font-semibold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2"><Menu /></button>
          
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Sparkles size={16} className="text-indigo-500"/> 
            <span>Welcome back, <b className="text-slate-900">{student.name}</b></span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><Bell size={20}/></button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {student.name.substring(0,2).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-8"><div className="max-w-7xl mx-auto">{children}</div></main>
      </div>
    </div>
  );
}