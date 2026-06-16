import React from "react";

interface StatusBadgeProps {
  variant: "success" | "danger" | "warning" | "info";
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export default function StatusBadge({ variant, label, icon: Icon }: StatusBadgeProps) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    danger: "bg-rose-50 text-rose-700 border-rose-200/60",
    warning: "bg-amber-50 text-amber-700 border-amber-200/60",
    info: "bg-blue-50 text-blue-700 border-blue-200/60",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold tracking-wide shadow-sm ${styles[variant]}`}>
      {Icon && <Icon size={13} className="shrink-0" />}
      {label}
    </span>
  );
}