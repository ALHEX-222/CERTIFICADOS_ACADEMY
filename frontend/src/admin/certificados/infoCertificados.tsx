'use client';

import AdminModal from '../components/AdminModal';
import {
  IoRibbonOutline,
  IoSchoolOutline,
  IoCalendarOutline,
  IoMailOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import type { Certificado } from '../../types/models';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: Certificado | null;
}

export function InfoCertificadoModal({ isOpen, onClose, item }: Props) {
  if (!item) return null;

  const calificacionFinal =
    item.calificacion_final !== null && item.calificacion_final !== undefined
      ? Number(item.calificacion_final)
      : null;

  const formatDate = (
    date: string | null | undefined,
    opts: Intl.DateTimeFormatOptions,
  ) => {
    if (!date) return '—';
    try {
      let parsedDate: Date;
      if (date.includes('T')) {
        parsedDate = new Date(date);
      } else {
        const [year, month, day] = date.slice(0, 10).split('-').map(Number);
        parsedDate = new Date(year, month - 1, day);
      }
      if (isNaN(parsedDate.getTime())) return '—';
      return parsedDate.toLocaleDateString('es-ES', opts);
    } catch {
      return '—';
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Resumen de Certificación"
      maxWidth="max-w-2xl"
      footer={
        <button
          onClick={onClose}
          className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5"
        >
          Cerrar Vista
        </button>
      }
    >
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col items-center justify-center py-8 md:py-12 bg-slate-900 rounded-[2rem] md:rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl shadow-slate-900/20 mx-1 md:mx-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 flex items-center justify-center text-sky-400 mb-4 md:mb-6 relative z-10 backdrop-blur-md">
            <IoRibbonOutline size={40} />
          </div>
          <h3 className="text-xl md:text-3xl font-black text-white tracking-tighter mb-3 relative z-10 uppercase text-center px-4">
            {item.codigo_certificado}
          </h3>
          <div className="px-4 md:px-6 py-2 rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] border backdrop-blur-md relative z-10 bg-sky-500/20 text-sky-300 border-sky-500/30">
            {item.tipo_certificado} · {item.estado}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="p-6 md:p-8 bg-slate-50/40 rounded-[2rem] border border-slate-100/50 space-y-4 md:space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-inner flex-shrink-0">
                <IoSchoolOutline size={22} />
              </div>
              <div className="min-w-0">
                <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Titular / Estudiante
                </label>
                <p className="text-sm md:text-[15px] font-bold text-slate-700 leading-tight truncate">
                  {item.nombre_estudiante || '—'}
                </p>
                <p className="text-[10px] md:text-[11px] font-semibold text-slate-400 leading-tight truncate mt-0.5">
                  DNI: {item.dni_estudiante || '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner flex-shrink-0">
                <IoCheckmarkCircleOutline size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Curso Acreditado
                </label>
                <p className="text-[12px] md:text-[13px] font-bold text-slate-700 leading-tight">
                  {item.nombre_curso || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-slate-50/40 rounded-[2rem] border border-slate-100/50 space-y-4 md:space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner flex-shrink-0">
                <IoCalendarOutline size={22} />
              </div>
              <div>
                <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Fecha de Emisión
                </label>
                <p className="text-sm md:text-[15px] font-bold text-slate-700 leading-tight">
                  {formatDate(item.fecha_emision, { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner flex-shrink-0">
                <IoTimeOutline size={22} />
              </div>
              <div>
                <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Carga Académica
                </label>
                <p className="text-sm md:text-[15px] font-bold text-slate-700 leading-tight">
                  {item.horas ?? '—'} Horas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner flex-shrink-0">
                <IoTimeOutline size={22} />
              </div>
              <div>
                <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Calificación Final
                </label>
                <p className="text-sm md:text-[15px] font-bold text-slate-700 leading-tight">
                  {calificacionFinal !== null && Number.isFinite(calificacionFinal)
                    ? calificacionFinal.toFixed(2)
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-1 md:px-2">
          <div className="p-4 md:p-6 bg-slate-100/50 rounded-2xl md:rounded-3xl border border-slate-200/50 flex items-center gap-4">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 flex-shrink-0">
              <IoCalendarOutline size={18} />
            </div>
            <div className="min-w-0">
              <label className="block text-[8px] md:text-[9px] font-black text-sky-600 uppercase tracking-[0.2em] mb-0.5">
                Rango Académico
              </label>
              <p className="text-[11px] md:text-xs font-black text-slate-600 truncate">
                {formatDate(item.fecha_inicio, { day: '2-digit', month: 'short' })} –{' '}
                {formatDate(item.fecha_fin, { day: '2-digit', month: 'short' })}
              </p>
            </div>
          </div>

          <div className="p-4 md:p-6 bg-slate-100/50 rounded-2xl md:rounded-3xl border border-slate-200/50 flex items-center gap-4">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <IoMailOutline size={18} />
            </div>
            <div className="min-w-0">
              <label className="block text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">
                Canal de Envío
              </label>
              <p className="text-[11px] md:text-xs font-black text-slate-600 truncate">
                {item.email_destinatario || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminModal>
  );
}

export default InfoCertificadoModal;