import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBgColor?: string;
  iconColor?: string;
}

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconBgColor = "bg-violet-50",
  iconColor = "text-violet-600",
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`rounded-lg p-2 ${iconBgColor} ${iconColor}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold tracking-tight text-slate-800">{value}</span>
        {subtext && <span className="block text-xs font-medium text-slate-400 mt-0.5">{subtext}</span>}
      </div>
    </div>
  );
}