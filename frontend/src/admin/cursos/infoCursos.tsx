'use client';

import AdminModal from '../components/AdminModal';
import type { Curso } from '../../types/models';
import { IoInformationCircleOutline, IoDocumentTextOutline } from 'react-icons/io5';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
}

export function InfoCursoModal({ isOpen, onClose, curso }: Props) {
  if (!curso) return null;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Información del Curso"
      maxWidth="max-w-2xl"
      footer={
        <button
          onClick={onClose}
          className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5"
        >
          Entendido
        </button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              ID: #{curso.id_curso}
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight tracking-tight mt-1">
              {curso.nombre}
            </h3>
          </div>

          <span
            className={`shrink-0 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
              curso.estado === 'Activo'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}
          >
            {curso.estado}
          </span>
        </div>

        <div className="bg-slate-50/40 p-6 rounded-[2rem] border border-slate-100/50 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white text-sky-600 flex items-center justify-center shadow-sm border border-sky-100/50">
              <IoInformationCircleOutline size={20} />
            </div>
            <div className="flex flex-col">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">
                Académico
              </h4>
              <span className="text-[14px] font-black text-slate-900 tracking-tight">
                Detalles del Curso
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Descripción
              </span>
              <p className="text-[13px] text-slate-600 leading-relaxed mt-1.5 font-medium">
                {curso.descripcion || 'No disponible'}
              </p>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm h-fit">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Duración
              </span>
              <p className="text-sm font-black text-slate-900 mt-0.5">
                {curso.duracion || '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50/40 p-6 rounded-[2rem] border border-slate-100/50 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100/50">
              <IoDocumentTextOutline size={20} />
            </div>
            <div className="flex flex-col">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">
                Certificado
              </h4>
              <span className="text-[14px] font-black text-slate-900 tracking-tight">
                Texto del Certificado
              </span>
            </div>
          </div>

          <p className="text-[13px] text-slate-600 leading-relaxed font-medium whitespace-pre-line">
            {curso.texto_certificado || 'No se ha definido un texto de certificado para este curso.'}
          </p>
        </div>
      </div>
    </AdminModal>
  );
}