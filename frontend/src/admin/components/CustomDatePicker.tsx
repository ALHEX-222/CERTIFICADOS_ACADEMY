"use client";

import { useState, useEffect, useRef } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomDatePicker({ value, onChange, placeholder = "DD/MM/AAAA" }: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState(new Date());
  const ref = useRef<HTMLDivElement>(null);

  // Parse current value or use today
  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setCurrentView(parsed);
      }
    }
  }, [value]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const selected = new Date(currentView.getFullYear(), currentView.getMonth(), day);
    // Format as YYYY-MM-DD for input compatibility
    const year = selected.getFullYear();
    const month = String(selected.getMonth() + 1).padStart(2, '0');
    const d = String(selected.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    setOpen(false);
  };

  const renderCalendar = () => {
    const year = currentView.getFullYear();
    const month = currentView.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);

    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    const today = new Date();
    const selectedDate = value ? new Date(value) : null;

    for (let d = 1; d <= totalDays; d++) {
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
      const isSelected = selectedDate && selectedDate.getDate() === d && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;

      days.push(
        <button
          key={d}
          onClick={() => handleSelectDate(d)}
          className={`h-10 w-10 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center
            ${isSelected 
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-110" 
              : isToday 
                ? "bg-sky-50 text-sky-600 border border-sky-100" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
          `}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const formatDisplayDate = (val: string) => {
    if (!val) return "";
    const [y, m, d] = val.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div ref={ref} className="relative w-full">
      <div 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl md:rounded-2xl hover:bg-white hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300 group cursor-pointer"
      >
        <FaCalendarAlt className="text-slate-400 group-hover:text-sky-500 transition-colors" size={14} />
        <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest flex-1 ${value ? 'text-slate-900' : 'text-slate-400'}`}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        {value && (
          <FaTimes 
            className="text-slate-300 hover:text-rose-500 transition-colors" 
            size={12} 
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          />
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-5 z-[100] animate-fadeIn backdrop-blur-xl bg-white/95">
          <div className="flex items-center justify-between mb-6 px-2">
            <button onClick={handlePrevMonth} className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-sky-500 transition-all">
              <FaChevronLeft size={12} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                {monthNames[currentView.getMonth()]}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {currentView.getFullYear()}
              </span>
            </div>
            <button onClick={handleNextMonth} className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-sky-500 transition-all">
              <FaChevronRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["DO", "LU", "MA", "MI", "JU", "VI", "SA"].map(d => (
              <div key={d} className="h-8 flex items-center justify-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between px-2">
            <button 
              onClick={() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const d = String(today.getDate()).padStart(2, '0');
                onChange(`${year}-${month}-${d}`);
                setOpen(false);
              }}
              className="text-[10px] font-black uppercase tracking-widest text-sky-500 hover:text-sky-600 transition-colors"
            >
              Hoy
            </button>
            <button 
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
            >
              Borrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
