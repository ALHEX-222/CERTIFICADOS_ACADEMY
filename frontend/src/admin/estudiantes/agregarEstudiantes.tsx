'use client';

import React, { useState, useEffect, useRef } from 'react';
import InputComponent from '../components/InputComponent';
import TextareaComponent from '../components/TextareaComponent';
import SelectComponent from '../components/SelectComponent';
import AdminModal from '../components/AdminModal';
import { FaCloudUploadAlt, FaTimes, FaUser } from 'react-icons/fa';
import { IoPersonOutline, IoCallOutline } from 'react-icons/io5';
import { apiClient } from '../../services/apiClient';

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
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setApellidos('');
      setDni('');
      setEmail('');
      setTelefono('');
      setFechaNacimiento('');
      setDireccion('');
      setEstado('activo');
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    if (inputFileRef.current) inputFileRef.current.value = '';
  };

  const quitarImagen = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSave = async () => {
    if (!nombre.trim()) return alert('El nombre es obligatorio.');
    if (!apellidos.trim()) return alert('Los apellidos son obligatorios.');
    if (!dni.trim()) return alert('El DNI es obligatorio.');
    if (!email.trim()) return alert('El correo es obligatorio.');

    setIsSaving(true);
    try {
      let imagen_perfil: string | undefined;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('imagen', selectedFile);
        const res = await apiClient.post('/admin/estudiantes/upload', formData);
        imagen_perfil = res.data.url;
      }

      const data = {
        nombre,
        apellidos,
        dni,
        email,
        telefono: telefono || undefined,
        fecha_nacimiento: fechaNacimiento || undefined,
        direccion: direccion || undefined,
        imagen_perfil,
        estado,
      };

      const fueExitosa = await onSave(data);
      if (fueExitosa) onClose();
    } catch (error) {
      console.error('Error al crear el estudiante:', error);
      alert('Ocurrió un error al subir la imagen o crear el estudiante.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Estudiante"
      maxWidth="max-w-5xl"
      footer={
        <>
          <div className="w-full md:w-[240px] md:mr-auto">
            <SelectComponent
              value={estado}
              onChange={(e) => setEstado(e.target.value as 'activo' | 'inactivo')}
              options={[
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
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
      <div className="space-y-10 md:space-y-14 pb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shadow-sm">
              <IoPersonOutline size={18} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
              Datos Personales
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputComponent
                  label="Nombres"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: María Fernanda"
                />

                <InputComponent
                  label="Apellidos"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Ej: Gómez Ríos"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputComponent
                  label="DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ej: 74582136"
                />

                <InputComponent
                  label="Fecha de nacimiento"
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
              </div>

              <TextareaComponent
                label="Dirección"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej: Av. Los Álamos 245, Ica"
                className="h-24"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2.5">
                Foto de Perfil
              </label>

              {previewUrl ? (
                <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="w-full h-64 lg:h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    type="button"
                    onClick={quitarImagen}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-500 transition-colors backdrop-blur-sm"
                    title="Quitar imagen"
                  >
                    <FaTimes size={14} />
                  </button>
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-white/80">
                    Se subirá al crear
                  </span>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 lg:h-full min-h-[220px] border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-sky-400 hover:bg-sky-50/30 transition-all bg-slate-50/50">
                  <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImagenChange}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-400 flex items-center justify-center mb-3">
                    <FaCloudUploadAlt size={24} />
                  </div>
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wide">
                    Subir foto
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">JPG, PNG o WEBP</span>
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
              <IoCallOutline size={18} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
              Contacto
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
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