"use client";

import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: boolean;
}

export default function TextareaComponent({
  className = "",
  value,
  onChange,
  error,
  ...props
}: TextareaProps) {
  const isExceeded = props.maxLength && value && value.toString().length > props.maxLength;

  return (
    <div className="flex flex-col gap-2 w-full group">
      {props.label && (
        <div className="flex justify-between items-center px-1">
          <label className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors
            ${isExceeded || error ? "text-rose-500" : "group-focus-within:text-sky-500 text-gray-400"}
          `}>
            {props.label}
          </label>
          {props.maxLength && value !== undefined && (
            <span className={`text-[9px] font-bold ${isExceeded ? "text-rose-500" : "text-gray-300"}`}>
              {value.toString().length}/{props.maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        value={value}
        onChange={onChange}
        className={`w-full px-6 py-4 bg-gray-50/50 border rounded-[1.25rem] outline-none transition-all duration-300 text-[#0E1C2B] font-semibold placeholder:text-gray-300 shadow-sm resize-none
          ${isExceeded || error 
            ? "border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/30" 
            : "border-gray-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:shadow-xl focus:shadow-sky-500/5"
          }
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
