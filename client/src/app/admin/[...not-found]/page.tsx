"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Construction } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4 text-slate-900">
      {/* Animated/Sleek Icon Component */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-500/10">
        <Construction size={32} />
      </div>

      {/* Error Message */}
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Page Under Construction
      </h2>
      <p className="mt-3 max-w-md text-base text-slate-800">
        <span className="text-black font-bold">Feature Under Construction</span> `{'>'}` Access to this page is restricted while we deploy updates and optimize data sync for this module.
      </p>

      {/* Quick Action Button */}
      <div className="mt-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}