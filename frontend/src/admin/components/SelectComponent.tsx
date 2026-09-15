"use client";

import React from "react";
import { IoChevronDown } from "react-icons/io5";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
}

export default function SelectComponent({
  label,
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-2 w-full group relative">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1 group-focus-within:text-sky-500 transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] outline-none transition-all duration-300 text-[#0E1C2B] font-semibold appearance-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:shadow-xl focus:shadow-sky-500/5 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-sky-500 transition-colors">
          <IoChevronDown size={18} />
        </div>
      </div>
    </div>
  );
}
