import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = "Search here..." }: SearchInputProps) {
  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-700 outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
      />
    </div>
  );
}