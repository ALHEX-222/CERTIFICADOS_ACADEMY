import { useState, useRef, useEffect, useMemo } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import type { Modulo } from "../../types/models";

interface FiltroModuloProps {
  value: number | "";
  onChange: (v: number | "") => void;
  modulos: Modulo[];
}

export function FiltroModulo({ value, onChange, modulos }: FiltroModuloProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const labelActual =
    (value !== "" && modulos.find((m) => m.id_modulo === value)?.titulo) ||
    "Todos los módulos";

  const opciones = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return modulos;
    return modulos.filter((m) => m.titulo.toLowerCase().includes(t));
  }, [q, modulos]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full sm:w-auto min-w-[220px]">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setQ("");
        }}
        className="w-full flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${value !== "" ? 'bg-sky-500 animate-pulse' : 'bg-slate-300'}`} />
        <span className="truncate text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors flex-1 text-left">{labelActual}</span>
        <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-sky-500" : ""}`} size={10} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50 animate-fadeIn overflow-hidden backdrop-blur-xl bg-white/95">
          <div className="px-3 py-2 border-b border-slate-50 mb-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Filtrar por Módulo</span>
          </div>
          <div className="p-3 relative group">
            <IoSearchOutline className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={14} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar módulo…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-[11px] font-bold text-slate-700 focus:ring-0 placeholder:text-slate-300"
            />
          </div>

          <div className="max-h-72 overflow-y-auto p-1 custom-scrollbar">
            <button
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 flex items-center gap-3
                ${value === "" ? "bg-sky-50 text-sky-600 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
              `}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${value === "" ? "bg-sky-500 animate-pulse" : "bg-slate-300"}`} />
              Todos los módulos
            </button>
            
            <div className="h-[1px] bg-slate-50 my-1 mx-2" />

            {opciones.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Sin resultados</p>
              </div>
            )}

            {opciones.map((m) => (
              <button
                key={m.id_modulo}
                className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold transition-all mb-1 flex items-center gap-3
                  ${value === m.id_modulo ? "bg-sky-500/10 text-sky-600 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                `}
                onClick={() => {
                  onChange(m.id_modulo);
                  setOpen(false);
                }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${value === m.id_modulo ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" : "bg-slate-200"}`} />
                <span className="truncate">{m.titulo}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
