'use client';

import { useEffect, useState } from 'react';
import AdminModal from '../components/AdminModal';
import InputComponent from '../components/InputComponent';
import TextareaComponent from '../components/TextareaComponent';
import SelectComponent from '../components/SelectComponent';
import type { Certificado, Curso } from '../../types/models';
import { IoRibbonOutline } from 'react-icons/io5';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  item: Certificado;
  cursos: Curso[];
  onSave: (data: Partial<Certificado> & { id_curso: number }) => Promise<boolean>;
};

export function EditCertificadoModal({ isOpen, onClose, item, cursos, onSave }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombreEstudiante, setNombreEstudiante] = useState('');
  const [dniEstudiante, setDniEstudiante] = useState('');
  const [idCurso, setIdCurso] = useState<number | ''>('');
  const [tipoCertificado, setTipoCertificado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [horas, setHoras] = useState<number | ''>('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [calificacionFinal, setCalificacionFinal] = useState<number | ''>('');
  const [emailDestinatario, setEmailDestinatario] = useState('');
  const [estado, setEstado] = useState('Activo');

  useEffect(() => {
    if (!item || !isOpen) return;

    setNombreEstudiante(item.nombre_estudiante || '');
    setDniEstudiante(item.dni_estudiante || '');
    setIdCurso(item.id_curso ?? '');
    setTipoCertificado(item.tipo_certificado || '');
    setDescripcion(item.descripcion || '');
    setHoras(item.horas ?? '');
    setFechaInicio(item.fecha_inicio ? item.fecha_inicio.slice(0, 10) : '');
    setFechaFin(item.fecha_fin ? item.fecha_fin.slice(0, 10) : '');
    setFechaEmision(item.fecha_emision ? item.fecha_emision.slice(0, 10) : '');
    setCalificacionFinal(
      item.calificacion_final !== null && item.calificacion_final !== undefined
        ? Number(item.calificacion_final)
        : '',
    );
    setEmailDestinatario(item.email_destinatario || '');
    setEstado(item.estado || 'Activo');
    setError(null);
  }, [item, isOpen]);

  const handleUpdate = async () => {
    setError(null);

    if (!idCurso) return setError('Selecciona un curso.');
    if (!nombreEstudiante.trim()) return setError('El nombre del estudiante es obligatorio.');

    setIsSaving(true);

    try {
      const payload = {
        id_curso: Number(idCurso),
        nombre_estudiante: nombreEstudiante.trim(),
        dni_estudiante: dniEstudiante.trim() || undefined,
        tipo_certificado: tipoCertificado.trim() || undefined,
        descripcion: descripcion.trim() || undefined,
        horas: horas === '' ? undefined : Number(horas),
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
        fecha_emision: fechaEmision || undefined,
        calificacion_final: calificacionFinal === '' ? undefined : Number(calificacionFinal),
        email_destinatario: emailDestinatario.trim() || undefined,
        estado,
      };

      const ok = await onSave(payload);
      if (ok) onClose();
      else setError('No se pudo actualizar el registro.');
    } catch (err) {
      setError('Error de red al intentar actualizar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Certificado: ${item?.codigo_certificado}`}
      maxWidth="max-w-3xl"
      footer={
        <>
          <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 w-full md:w-auto justify-center md:justify-start md:mr-auto">
            Actualización de Registro
          </div>
          <button
            onClick={handleUpdate}
            disabled={isSaving}
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5 disabled:opacity-50 text-sm"
          >
            {isSaving ? 'Cargando...' : 'Guardar Cambios'}
          </button>
          <button
            onClick={onClose}
            className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm"
          >
            Cancelar
          </button>
        </>
      }
    >
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 p-6 md:p-10 bg-amber-50/40 rounded-[2rem] border border-amber-100/50">
          <div className="w-16 h-16 bg-white rounded-[1.25rem] shadow-xl shadow-amber-200/50 flex items-center justify-center text-amber-500 shrink-0 border border-white">
            <IoRibbonOutline size={34} />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-[9px] md:text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] bg-amber-100 px-4 py-1 rounded-full border border-amber-200/50 w-fit mb-3 mx-auto md:mx-0">
              Actualización de Registro
            </h4>
            <p className="text-[12px] md:text-[13px] font-bold text-slate-400 leading-relaxed max-w-lg">
              Cambios en nombre/DNI del estudiante solo afectan a este certificado, no al registro
              del estudiante.
            </p>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6 bg-slate-50/40 p-6 md:p-8 rounded-[2rem] border border-slate-100/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InputComponent
              label="Nombre del Estudiante"
              value={nombreEstudiante}
              onChange={(e) => setNombreEstudiante(e.target.value)}
            />
            <InputComponent
              label="DNI del Estudiante"
              value={dniEstudiante}
              onChange={(e) => setDniEstudiante(e.target.value)}
              placeholder="Ej: 12345678"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <SelectComponent
              label="Curso"
              value={idCurso === '' ? '' : String(idCurso)}
              onChange={(e) => setIdCurso(e.target.value ? Number(e.target.value) : '')}
              options={[
                { value: '', label: 'Selecciona un curso' },
                ...cursos.map((c) => ({ value: String(c.id_curso), label: c.nombre })),
              ]}
            />
            <InputComponent
              label="Tipo de Certificado"
              value={tipoCertificado}
              onChange={(e) => setTipoCertificado(e.target.value)}
            />
          </div>

          <TextareaComponent
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="h-24"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InputComponent
              label="Fecha Inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
            <InputComponent
              label="Fecha Culminación"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InputComponent
              label="Fecha de Emisión"
              type="date"
              value={fechaEmision}
              onChange={(e) => setFechaEmision(e.target.value)}
            />
            <SelectComponent
              label="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              options={[
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
                { value: 'Revocado', label: 'Revocado' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <InputComponent
              label="Horas"
              type="number"
              value={String(horas)}
              onChange={(e) => setHoras(e.target.value ? Number(e.target.value) : '')}
            />
            <InputComponent
              label="Nota Final"
              type="number"
              value={String(calificacionFinal)}
              onChange={(e) => setCalificacionFinal(e.target.value ? Number(e.target.value) : '')}
              min="0"
              max="20"
              step="0.01"
            />
            <InputComponent
              label="Email de Notificación"
              type="email"
              value={emailDestinatario}
              onChange={(e) => setEmailDestinatario(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 mx-1">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <p className="text-[10px] md:text-xs font-bold text-rose-600 uppercase tracking-wider">{error}</p>
          </div>
        )}
      </div>
    </AdminModal>
  );
}

export default EditCertificadoModal;