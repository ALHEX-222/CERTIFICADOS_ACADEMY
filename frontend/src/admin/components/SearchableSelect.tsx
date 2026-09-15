import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChevronDown, IoSearch, IoCloseCircle } from 'react-icons/io5';

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecciona…',
  noOptionsMessage = 'Sin resultados',
  label,
}: {
  value: number | '';
  onChange: (v: number | '') => void;
  options: { value: number | ''; label: string }[];
  placeholder?: string;
  noOptionsMessage?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Ahora también encuentra correctamente las opciones con value === ''
  const opcionSeleccionada = options.find((o) => o.value === value);
  const labelActual = opcionSeleccionada?.label || '';

  const filtradas = useMemo(() => {
    const t = q.toLowerCase();

    return options.filter((o) => o.label.toLowerCase().includes(t));
  }, [q, options]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full group relative" ref={ref}>
      {label && (
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-sky-500 transition-colors">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          onFocus={() => setOpen(true)}
          value={open ? q : labelActual}
          onChange={(e) => {
            setQ(e.target.value);

            if (!open) {
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          className={`w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-[#0E1C2B] font-medium placeholder:text-slate-300 shadow-sm pr-12 text-sm`}
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-2">
          {open ? (
            <IoSearch size={18} className="text-sky-500 animate-pulse" />
          ) : (
            <IoChevronDown
              size={18}
              className={`transition-transform duration-300 ${
                open ? 'rotate-180 text-sky-500' : ''
              }`}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] top-full left-0 right-0 mt-3 max-h-72 overflow-auto rounded-[2rem] border border-slate-100 bg-white/95 shadow-[0_30px_60px_rgba(15,23,42,0.15)] backdrop-blur-xl p-2 custom-scrollbar"
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="px-3 py-2 mb-2 border-b border-slate-50">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Opciones disponibles
              </span>
            </div>

            <button
              onClick={() => {
                onChange('');
                setQ('');
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all font-black uppercase tracking-widest text-[10px] mb-1 flex items-center gap-3
                ${
                  value === '' && !options.some((o) => o.value === '')
                    ? 'bg-sky-50 text-sky-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  value === '' && !options.some((o) => o.value === '')
                    ? 'bg-sky-500 animate-pulse'
                    : 'bg-slate-300'
                }`}
              />
              Todas las opciones
            </button>

            {filtradas.length === 0 && q && (
              <div className="px-4 py-10 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-2">
                  <IoSearch size={24} className="text-slate-300" />
                </div>

                <span className="text-xs font-bold text-slate-400 italic">{noOptionsMessage}</span>
              </div>
            )}

            {filtradas.map((o) => (
              <button
                key={String(o.value)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm mb-1 flex items-center gap-3
                  ${
                    value === o.value
                      ? 'bg-sky-500/10 text-sky-600 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
                onClick={() => {
                  onChange(o.value);
                  setQ('');
                  setOpen(false);
                }}
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    value === o.value
                      ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                      : 'bg-slate-200'
                  }`}
                />

                <span className="truncate">{o.label}</span>
              </button>
            ))}

            {value !== '' && (
              <div className="mt-2 pt-2 border-t border-slate-50">
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  onClick={() => {
                    onChange('');
                    setQ('');
                    setOpen(false);
                  }}
                >
                  <IoCloseCircle size={16} />
                  Limpiar Filtro
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
