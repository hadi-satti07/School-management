"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  DollarSign,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  Menu,
  X,
  User,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { clsx } from "clsx";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Students", icon: GraduationCap, href: "/admin/students" },
  { label: "Teachers", icon: Users, href: "/admin/teachers" },
  { label: "Classes", icon: BookOpen, href: "/admin/classes" },
  { label: "Fees", icon: DollarSign, href: "/admin/fees" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

// Mock Notifications Data for IBN-e-ADAM System
const initialNotifications = [
  { id: 1, text: "Sir Adam marked Grade 10-A attendance.", time: "5 mins ago", type: "info" },
  { id: 2, text: "New Student registration request pending.", time: "1 hour ago", type: "warning" },
  { id: 3, text: "Monthly system backup completed successfully.", time: "2 hours ago", type: "success" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Core Layout States
  const [adminName, setAdminName] = useState("Admin User");
  const [adminEmail, setAdminEmail] = useState("codexhadi067@gmail.com");
  const [adminInitials, setAdminInitials] = useState("AD");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // New Interactive Dropdown States
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Refs to close dropdowns when clicking outside
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // 🔄 1. Fetch Authenticated Admin Session Data
  useEffect(() => {
    const cachedName = localStorage.getItem("userName");
    const cachedRole = localStorage.getItem("userRole");

    if (!cachedRole || cachedRole !== "admin") {
      localStorage.clear();
      router.push("/");
      return;
    }

    if (cachedName) {
      setAdminName(cachedName);
      const nameParts = cachedName.split(" ");
      const initials = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : `${nameParts[0][0]}${nameParts[0][1] || ""}`.toUpperCase();
      setAdminInitials(initials);
    }
  }, [router]);

  // 🖱️ 2. Close Dropdowns on Outside Click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🚪 3. Logout Action Pipeline
  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm xl:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ========================================== */}
      {/* SIDEBAR COMPONENT */}
      {/* ========================================== */}
      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-800 bg-slate-950 transition-transform duration-300 flex flex-col justify-between",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 py-5">
          <div className="mb-8 flex items-center justify-between px-2">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xl font-black tracking-tight text-white uppercase">
                IBN-e-ADAM
              </span>
            </Link>
            <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400 hover:text-white xl:hidden">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={clsx(
                    "group flex items-center rounded-xl px-3.5 py-3 text-xs font-bold tracking-wide transition-all relative",
                    isActive
                      ? "bg-slate-900 text-emerald-400 border border-slate-800/60"
                      : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                  )}
                >
                  <span className={clsx("mr-3 transition-colors", isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300")}>
                    <Icon size={18} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {isActive && <div className="absolute left-0 h-6 w-1 rounded-r-full bg-emerald-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-900 bg-slate-950/60 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black text-xs shadow-sm">
              {adminInitials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-bold text-slate-100">{adminName}</p>
              <p className="truncate text-[10px] text-slate-500 font-semibold tracking-wider uppercase">System Controller</p>
            </div>
            <button 
              onClick={handleLogout}
              title="Logout System"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-900 hover:text-rose-400 transition-all active:scale-95"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN CONTENT AREA & HEADER WORKSPACE */}
      {/* ========================================== */}
      <div className="flex flex-col xl:pl-64">
        
        <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between bg-white/80 px-6 backdrop-blur-md border-b border-slate-200/40 shadow-sm">
          
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 xl:hidden">
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-base font-black tracking-tight text-slate-900 sm:text-lg">
                Welcome back, {adminName.split(" ")[0]}
              </h1>
              <p className="hidden text-xs text-slate-400 font-medium sm:block">
                Here's what's happening in your school administration panel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden lg:block">
              <div className={clsx("flex items-center rounded-xl border transition-all duration-300", searchFocused ? "w-72 border-emerald-500 bg-white shadow-sm ring-4 ring-emerald-50" : "w-60 border-slate-200/60 bg-slate-50/60")}>
                <div className="pl-3.5 text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Quick lookup system records..."
                  className="w-full bg-transparent px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </div>

            <div className="hidden h-6 w-px bg-slate-200 lg:block" />

            {/* 🔥 INTERACTIVE NOTIFICATION DROPDOWN SYSTEM */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => { setNotificationOpen(!notificationOpen); setProfileOpen(false); }}
                className={clsx(
                  "relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95",
                  notificationOpen ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                <Bell size={17} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border border-white bg-rose-500 animate-pulse" />
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">System Notifications</p>
                    {notifications.length > 0 && (
                      <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-rose-500 hover:underline">Clear all</button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                        <CheckCircle2 size={24} className="text-emerald-500 mb-1" />
                        <p className="text-xs font-bold">No unread alerts</p>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div key={item.id} className="flex gap-2.5 rounded-xl p-2.5 hover:bg-slate-50/80 transition-colors cursor-pointer">
                          <div className={clsx(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                            item.type === "warning" ? "bg-amber-50 text-amber-600 border-amber-100" : item.type === "success" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                          )}>
                            {item.type === "warning" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <p className="text-[11px] font-semibold text-slate-700 leading-normal">{item.text}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{item.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 🔥 INTERACTIVE USER PROFILE DROPDOWN HUB */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => { setProfileOpen(!profileOpen); setNotificationOpen(false); }}
                className={clsx(
                  "flex items-center gap-2 rounded-xl border p-1 pr-3 bg-white transition-all shadow-sm active:scale-98",
                  profileOpen ? "border-emerald-500 ring-2 ring-emerald-50" : "border-slate-200/80 hover:border-slate-300"
                )}
              >
                <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 font-extrabold text-xs flex items-center justify-center">
                  {adminInitials}
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-[11px] font-black text-slate-800 leading-tight">{adminName}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Super Admin</p>
                </div>
                <ChevronDown size={12} className={clsx("text-slate-400 transition-transform duration-200 hidden md:block", profileOpen && "rotate-180")} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="border-b border-slate-100 px-3.5 py-3">
                    <p className="text-xs font-black text-slate-900 leading-none mb-1">{adminName}</p>
                    <p className="text-[10px] font-medium text-slate-400 truncate">{adminEmail}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link href="/admin/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                      <User size={14} className="text-slate-400" />
                      Account Profile
                    </Link>
                    <Link href="/admin/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                      <Settings size={14} className="text-slate-400" />
                      Console Settings
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button 
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut size={14} />
                      Sign Out System
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dynamic Workspace Slot */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}