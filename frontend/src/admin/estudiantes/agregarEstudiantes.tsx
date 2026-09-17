'use client';

import React, { useState, useEffect } from 'react';
import InputComponent from '../components/InputComponent';
import SelectComponent from '../components/SelectComponent';
import AdminModal from '../components/AdminModal';
import { IoPersonOutline } from 'react-icons/io5';

interface AddEstudianteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<boolean>;
}

export const AddEstudianteModal: React.FC<AddEstudianteModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNombreCompleto('');
      setNumeroDocumento('');
      setEmail('');
      setTelefono('');
      setEstado('Activo');
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!nombreCompleto.trim()) return alert('El nombre completo es obligatorio.');
    if (!numeroDocumento.trim()) return alert('El número de documento es obligatorio.');
    if (!email.trim()) return alert('El correo es obligatorio.');

    setIsSaving(true);
    try {
      const data = {
        nombre_completo: nombreCompleto,
        numero_documento: numeroDocumento,
        email,
        telefono: telefono || undefined,
        estado,
      };

      const fueExitosa = await onSave(data);
      if (fueExitosa) onClose();
    } catch (error) {
      console.error('Error al crear el estudiante:', error);
      alert('Ocurrió un error al crear el estudiante.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Estudiante"
      maxWidth="max-w-2xl"
      footer={
        <>
          <div className="w-full md:w-[240px] md:mr-auto">
            <SelectComponent
              value={estado}
              onChange={(e) => setEstado(e.target.value as 'Activo' | 'Inactivo')}
              options={[
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
              ]}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-sky-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              'Crear Estudiante'
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
      <div className="space-y-8 pb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shadow-sm">
              <IoPersonOutline size={18} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
              Datos del Estudiante
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputComponent
              label="Nombre completo"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="Ej: María Fernanda Gómez Ríos"
            />

            <InputComponent
              label="N° de documento"
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
              placeholder="Ej: 74582136"
            />

            <InputComponent
              label="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: maria.gomez@correo.com"
            />

            <InputComponent
              label="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 987654321"
            />
          </div>
        </div>
      </div>
    </AdminModal>
  );
};