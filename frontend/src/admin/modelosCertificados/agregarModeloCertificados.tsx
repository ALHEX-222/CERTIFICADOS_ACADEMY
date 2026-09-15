'use client';

import React, { useState, useEffect, useRef } from 'react';
import InputComponent from '../components/InputComponent';
import TextareaComponent from '../components/TextareaComponent';
import SelectComponent from '../components/SelectComponent';
import AdminModal from '../components/AdminModal';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { IoImagesOutline } from 'react-icons/io5';
import { apiClient } from '../../services/apiClient';

interface AgregarModeloCertificadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<boolean>;
}

export const AgregarModeloCertificadoModal: React.FC<AgregarModeloCertificadoModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setDescripcion('');
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
    if (!nombre.trim()) return alert('El nombre del modelo es obligatorio.');
    if (!selectedFile) return alert('Debes subir una imagen de plantilla.');

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('imagen', selectedFile);
      const res = await apiClient.post('/admin/modelos-certificados/upload', formData);
      const imagen = res.data.url;

      const data = {
        nombre,
        descripcion: descripcion || undefined,
        imagen,
        estado,
      };

      const fueExitosa = await onSave(data);
      if (fueExitosa) onClose();
    } catch (error) {
      console.error('Error al crear el modelo de certificado:', error);
      alert('Ocurrió un error al subir la imagen o crear el modelo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Modelo de Certificado"
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
              'Crear Modelo'
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
      <div className="space-y-10 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-7">
            <InputComponent
              label="Nombre del modelo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Certificado de Finalización - Clásico"
            />

            <TextareaComponent
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Plantilla usada para cursos de nivel básico"
              className="h-32"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2.5">
              Plantilla del Certificado
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
                  Subir plantilla
                </span>
                <span className="text-[10px] text-gray-400 mt-1">JPG, PNG o WEBP</span>
              </label>
            )}
          </div>
        </div>
      </div>
    </AdminModal>
  );
};