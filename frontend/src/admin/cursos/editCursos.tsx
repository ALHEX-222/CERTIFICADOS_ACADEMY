'use client';

import React, { useState, useEffect } from 'react';
import InputComponent from '../components/InputComponent';
import TextareaComponent from '../components/TextareaComponent';
import SelectComponent from '../components/SelectComponent';
import AdminModal from '../components/AdminModal';
import type { Curso } from '../../types/models';
import { IoBookOutline, IoDocumentTextOutline, IoSaveOutline, IoSparklesOutline } from 'react-icons/io5';

interface EditCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso;
  onSave: (cursoActualizado: Curso) => Promise<boolean>;
  isLoading?: boolean;
}

export const EditCursoModal: React.FC<EditCursoModalProps> = ({
  isOpen,
  onClose,
  curso,
  onSave,
  isLoading = false,
}) => {
  const [nombre, setNombre] = useState<string>('');
  const [duracion, setDuracion] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [textoCertificado, setTextoCertificado] = useState<string>('');
  const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && curso) {
      setNombre(curso.nombre ?? '');
      setDuracion(curso.duracion?.toString() ?? '');
      setDescripcion(curso.descripcion ?? '');
      setTextoCertificado(curso.texto_certificado ?? '');
      setEstado((curso.estado as 'Activo' | 'Inactivo') ?? 'Activo');
    }
  }, [isOpen, curso]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      alert('El nombre del curso es obligatorio.');
      return;
    }

    setIsSaving(true);

    try {
      const cursoActualizado: Curso = {
        ...curso,
        nombre: nombre.trim(),
        duracion: duracion.trim(),
        descripcion: descripcion.trim(),
        texto_certificado: textoCertificado.trim() || undefined,
        estado,
      };

      const fueExitosa = await onSave(cursoActualizado);

      if (fueExitosa) {
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar el curso:', error);
      alert('Ocurrió un error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Curso"
      maxWidth="max-w-2xl"
      footer={
        <>
          <div className="flex items-center gap-2 text-sky-500 font-bold text-[10px] md:text-xs animate-pulse bg-sky-50/50 md:bg-transparent w-full md:w-auto justify-center md:justify-start py-2.5 md:py-0 rounded-xl md:mr-auto">
            <IoSparklesOutline />
            <span>Editando registro</span>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-sky-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <IoSaveOutline size={18} /> Guardar Cambios
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-sm disabled:opacity-60"
          >
            Cancelar
          </button>
        </>
      }
    >
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 min-h-[200px]">
            <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
            <p className="text-sky-500 font-black text-[10px] uppercase tracking-widest animate-pulse">
              Cargando datos del curso...
            </p>
          </div>
        )}

        <div className="space-y-8">
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shadow-sm">
                <IoBookOutline size={18} />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
                Información del Curso
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputComponent
                label="Nombre del Curso"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Especialista en Power BI"
              />

              <InputComponent
                label="Duración"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                placeholder="Ej: 40 horas / 3 meses"
              />
            </div>

            <TextareaComponent
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del curso..."
              className="h-28"
            />
          </section>

          <section className="space-y-6 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 pt-6">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
                <IoDocumentTextOutline size={18} />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
                Certificado
              </h3>
            </div>

            <TextareaComponent
              label="Texto del Certificado"
              value={textoCertificado}
              onChange={(e) => setTextoCertificado(e.target.value)}
              placeholder="Texto que aparecerá en el certificado del estudiante..."
              className="h-28"
            />
          </section>

          <section className="pt-2 border-t border-gray-100 flex items-center gap-x-10">
            <SelectComponent
              label="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as 'Activo' | 'Inactivo')}
              options={[
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
              ]}
              className="!py-2.5 !px-5 text-sm"
            />
          </section>
        </div>
      </div>
    </AdminModal>
  );
};