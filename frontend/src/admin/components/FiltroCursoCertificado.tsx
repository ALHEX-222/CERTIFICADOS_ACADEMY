import { useState, useMemo, useEffect, useRef } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';

export type OpcionFiltroPrograma = {
  value: string;
  label: string;
};

type FiltroCursoProps = {
  value: string;
  onChange: (value: string) => void;
  opciones: OpcionFiltroPrograma[];
  placeholder: string;
};

export default function FiltroCurso({ value, onChange, opciones, placeholder }: FiltroCursoProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const sinOpciones = opciones.length === 0;

  const opcionSeleccionada = opciones.find((opcion) => opcion.value === value);

  const textoTodos =
    placeholder === 'Filtrar por curso'
      ? 'Todos los cursos'
      : placeholder === 'Filtrar por programa'
        ? 'Todos los programas'
        : 'Todos los cursos o programas';

  const labelActual = sinOpciones
    ? `Sin ${placeholder.replace('Filtrar por ', '').toLowerCase()} disponibles`
    : (opcionSeleccionada?.label ?? textoTodos);

  const opcionesFiltradas = useMemo(() => {
    const termino = q.trim().toLowerCase();

    if (!termino) {
      return opciones;
    }

    return opciones.filter((opcion) => opcion.label.toLowerCase().includes(termino));
  }, [q, opciones]);

  useEffect(() => {
    if (sinOpciones) {
      setOpen(false);
      setQ('');
    }
  }, [sinOpciones]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!ref.current) return;

      if (!ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);

    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
    };
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <button
        type="button"
        disabled={sinOpciones}
        onClick={() => {
          if (sinOpciones) return;

          setOpen((isOpen) => !isOpen);
          setQ('');
        }}
        className={`w-full px-4 py-2.5 border rounded-2xl text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${
          sinOpciones
            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-slate-800">{labelActual}</span>

        <FaChevronDown className={`ml-2 ${sinOpciones ? 'opacity-30' : 'opacity-70'}`} />
      </button>

      {open && !sinOpciones && (
        <div className="absolute z-50 mt-2 w-full min-w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl">
          <div className="flex items-center gap-2 px-2 pt-2">
            <input
              autoFocus
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder={`Buscar ${placeholder.replace('Filtrar por ', '').toLowerCase()}...`}
              className="flex-1 px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            {q && (
              <button
                type="button"
                title="Limpiar búsqueda"
                onClick={() => setQ('')}
                className="p-2 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-auto py-1">
            <button
              type="button"
              className="w-full text-left px-4 py-3 text-slate-700 font-medium hover:bg-slate-100"
              onClick={() => {
                onChange('');
                setOpen(false);
                setQ('');
              }}
            >
              {textoTodos}
            </button>

            {opcionesFiltradas.length === 0 && (
              <div className="px-4 py-3 text-sm text-slate-500">Sin resultados</div>
            )}

            {opcionesFiltradas.map((opcion) => (
              <button
                type="button"
                key={opcion.value}
                className="w-full text-left px-4 py-3 text-slate-800 font-medium hover:bg-slate-100"
                onClick={() => {
                  onChange(opcion.value);
                  setOpen(false);
                  setQ('');
                }}
              >
                {opcion.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
