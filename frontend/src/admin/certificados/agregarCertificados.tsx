'use client';

import { useMemo, useState } from 'react';
import AdminModal from '../components/AdminModal';
import InputComponent from '../components/InputComponent';
import TextareaComponent from '../components/TextareaComponent';
import SelectComponent from '../components/SelectComponent';
import type { Curso, Estudiante } from '../../types/models';
import { IoRibbonOutline, IoPersonAddOutline } from 'react-icons/io5';

type NuevoCertificadoPayload = {
  id_estudiante?: number;
  nombre_estudiante?: string;
  dni_estudiante?: string;
  id_curso: number;
  tipo_certificado?: string;
  descripcion?: string;
  horas?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_emision?: string;
  calificacion_final?: number;
  email_destinatario?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  cursos: Curso[];
  estudiantes: Estudiante[];
  onSave: (data: NuevoCertificadoPayload) => Promise<boolean>;
};

export function AddCertificadoModal({ isOpen, onClose, cursos, estudiantes, onSave }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modo, setModo] = useState<'registrado' | 'nuevo'>('registrado');
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [selectedEstudianteId, setSelectedEstudianteId] = useState<number | ''>('');

  const [nombreEstudiante, setNombreEstudiante] = useState('');
  const [dniEstudiante, setDniEstudiante] = useState('');

  const [idCurso, setIdCurso] = useState<number | ''>('');
  const [tipoCertificado, setTipoCertificado] = useState('Certificado de Aprobación');
  const [descripcion, setDescripcion] = useState('');
  const [horas, setHoras] = useState<number | ''>('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [calificacionFinal, setCalificacionFinal] = useState<number | ''>('');
  const [emailDestinatario, setEmailDestinatario] = useState('');

  const resetForm = () => {
    setModo('registrado');
    setBusquedaEstudiante('');
    setSelectedEstudianteId('');
    setNombreEstudiante('');
    setDniEstudiante('');
    setIdCurso('');
    setTipoCertificado('Certificado de Aprobación');
    setDescripcion('');
    setHoras('');
    setFechaInicio('');
    setFechaFin('');
    setFechaEmision('');
    setCalificacionFinal('');
    setEmailDestinatario('');
    setError(null);
  };

  const estudiantesFiltrados = useMemo(() => {
    const t = busquedaEstudiante.toLowerCase().trim();
    if (!t) return estudiantes.slice(0, 20);
    return estudiantes
      .filter(
        (e) =>
          e.nombre_completo?.toLowerCase().includes(t) ||
          e.numero_documento?.toLowerCase().includes(t) ||
          (e.email ?? '').toLowerCase().includes(t),
      )
      .slice(0, 20);
  }, [estudiantes, busquedaEstudiante]);

  const handleSelectEstudiante = (e: Estudiante) => {
    setSelectedEstudianteId(e.id_estudiante);
    setBusquedaEstudiante(e.nombre_completo);
    setEmailDestinatario((prev) => prev || e.email || '');
  };

  const handleSubmit = async () => {
    setError(null);

    if (!idCurso) return setError('Selecciona un curso.');

    if (modo === 'registrado' && !selectedEstudianteId) {
      return setError('Selecciona un estudiante registrado, o cambia a "Estudiante nuevo".');
    }

    if (modo === 'nuevo' && (!nombreEstudiante.trim() || !dniEstudiante.trim())) {
      return setError('Nombre y documento son obligatorios para registrar un estudiante nuevo.');
    }

    setIsSaving(true);

    try {
      const payload: NuevoCertificadoPayload = {
        id_curso: Number(idCurso),
        tipo_certificado: tipoCertificado.trim() || undefined,
        descripcion: descripcion.trim() || undefined,
        horas: horas === '' ? undefined : Number(horas),
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
        fecha_emision: fechaEmision || undefined,
        calificacion_final: calificacionFinal === '' ? undefined : Number(calificacionFinal),
        email_destinatario: emailDestinatario.trim() || undefined,
      };

      if (modo === 'registrado') {
        payload.id_estudiante = Number(selectedEstudianteId);
      } else {
        payload.nombre_estudiante = nombreEstudiante.trim();
        payload.dni_estudiante = dniEstudiante.trim();
      }

      const ok = await onSave(payload);

      if (ok) {
        resetForm();
        onClose();
      } else {
        setError('Error al procesar la solicitud.');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Certificado"
      maxWidth="max-w-3xl"
      footer={
        <>
          <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 w-full md:w-auto justify-center md:justify-start md:mr-auto">
            El código se genera automáticamente
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5 disabled:opacity-50 text-sm"
          >
            {isSaving ? 'Cargando...' : 'Confirmar Emisión'}
          </button>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm"
          >
            Cancelar
          </button>
        </>
      }
    >
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 p-6 md:p-10 bg-slate-100/40 rounded-[2rem] border border-slate-200/50">
          <div className="w-16 h-16 bg-white rounded-[1.25rem] shadow-xl flex items-center justify-center text-sky-500 shrink-0 border border-slate-50">
            <IoRibbonOutline size={34} />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-[9px] md:text-[10px] font-black text-sky-600 uppercase tracking-[0.3em] bg-sky-100 px-4 py-1 rounded-full border border-sky-200/50 w-fit mb-3 mx-auto md:mx-0">
              Emisión de Certificado
            </h4>
            <p className="text-[12px] md:text-[13px] font-bold text-slate-400 leading-relaxed max-w-lg">
              El código de certificado se genera automáticamente al confirmar.
            </p>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6 bg-slate-50/40 p-6 md:p-8 rounded-[2rem] border border-slate-100/50">
          <div className="flex items-center gap-2 mb-2 ml-1">
            <div className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Estudiante
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={() => setModo('registrado')}
              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                modo === 'registrado'
                  ? 'bg-sky-50 text-sky-600 border-sky-200'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              Estudiante registrado
            </button>
            <button
              type="button"
              onClick={() => setModo('nuevo')}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                modo === 'nuevo'
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <IoPersonAddOutline size={14} /> Estudiante nuevo
            </button>
          </div>

          {modo === 'registrado' ? (
            <div className="space-y-3">
              <InputComponent
                label="Buscar Estudiante"
                value={busquedaEstudiante}
                onChange={(e) => {
                  setBusquedaEstudiante(e.target.value);
                  setSelectedEstudianteId('');
                }}
                placeholder="Buscar por nombre, DNI o email"
              />

              {busquedaEstudiante.trim() && !selectedEstudianteId && (
                <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                  {estudiantesFiltrados.length > 0 ? (
                    estudiantesFiltrados.map((e) => (
                      <button
                        key={e.id_estudiante}
                        type="button"
                        onClick={() => handleSelectEstudiante(e)}
                        className="w-full text-left px-4 py-3 border-b last:border-b-0 border-slate-100 hover:bg-sky-50 transition-colors"
                      >
                        <p className="text-sm font-bold text-slate-700">{e.nombre_completo}</p>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          DNI: {e.numero_documento || '—'} · {e.email || 'Sin email'}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-slate-400">
                      No se encontraron estudiantes. Cambia a "Estudiante nuevo" para registrarlo.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <InputComponent
                label="Nombre Completo"
                value={nombreEstudiante}
                onChange={(e) => setNombreEstudiante(e.target.value)}
                placeholder="Nombre y apellidos"
              />
              <InputComponent
                label="Número de Documento"
                value={dniEstudiante}
                onChange={(e) => setDniEstudiante(e.target.value)}
                placeholder="Ej: 12345678"
              />
            </div>
          )}
        </div>

        <div className="space-y-4 md:space-y-6 bg-slate-50/40 p-6 md:p-8 rounded-[2rem] border border-slate-100/50">
          <div className="flex items-center gap-2 mb-2 ml-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Programa y Detalles
            </span>
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
              placeholder="Ej: Certificado de Aprobación"
            />
          </div>

          <TextareaComponent
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción opcional..."
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
            <InputComponent
              label="Fecha de Emisión"
              type="date"
              value={fechaEmision}
              onChange={(e) => setFechaEmision(e.target.value)}
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
              placeholder="Ej. 18.50"
              min="0"
              max="20"
              step="0.01"
            />
            <InputComponent
              label="Email de Notificación"
              type="email"
              value={emailDestinatario}
              onChange={(e) => setEmailDestinatario(e.target.value)}
              placeholder="ejemplo@correo.com"
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

export default AddCertificadoModal;