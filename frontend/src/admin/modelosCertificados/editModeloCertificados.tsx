'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import InputComponent from '../components/InputComponent';
import TextareaComponent from '../components/TextareaComponent';
import SelectComponent from '../components/SelectComponent';
import AdminModal from '../components/AdminModal';
import { FaCloudUploadAlt, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import { apiClient } from '../../services/apiClient';
import { resolveAvatarUrl } from '../../config/api';

interface EditModeloCertificadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelo: any;
  onSave: (data: any) => Promise<boolean>;
}

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const EditModeloCertificadoModal: React.FC<EditModeloCertificadoModalProps> = ({
  isOpen,
  onClose,
  modelo,
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo');

  const [imagenExistente, setImagenExistente] = useState<string | null>(null);
  const [imagenOriginal, setImagenOriginal] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imagenError, setImagenError] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (isOpen && modelo) {
      setNombre(modelo.nombre || '');
      setDescripcion(modelo.descripcion || '');
      setEstado(modelo.estado || 'activo');
      setImagenExistente(modelo.imagen || null);
      setImagenOriginal(modelo.imagen || null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setImagenError(false);
      setFileError(null);
    }
  }, [isOpen, modelo]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validarArchivo = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato no permitido. Usa JPG, PNG o WEBP.';
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `El archivo supera el tamaño máximo de ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const procesarArchivo = useCallback(
    (file: File | undefined) => {
      if (!file) return;

      const error = validarArchivo(file);
      if (error) {
        setFileError(error);
        return;
      }

      setFileError(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImagenError(false);
    },
    [previewUrl],
  );

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    procesarArchivo(e.target.files?.[0]);
    if (inputFileRef.current) inputFileRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    procesarArchivo(e.dataTransfer.files?.[0]);
  };

  const quitarImagen = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setImagenExistente(null);
    setImagenError(false);
    setFileError(null);
  };

  const imagenAMostrar = previewUrl || (imagenExistente ? resolveAvatarUrl(imagenExistente) : null);

  const eliminarImagenAnterior = async (rutaImagenAnterior: string) => {
    try {
      await apiClient.delete('/admin/modelos-certificados/imagen', {
        data: { imagen: rutaImagenAnterior },
      });
    } catch (error) {
      console.error('Error al eliminar la imagen anterior:', error);
    }
  };

  const handleSave = async () => {
    if (!nombre.trim()) return alert('El nombre del modelo es obligatorio.');
    if (fileError) return;

    setIsSaving(true);
    let imagenSubida: string | null = null;

    try {
      let imagen: string | undefined = imagenExistente || undefined;

      if (selectedFile) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('imagen', selectedFile);
        const res = await apiClient.post('/admin/modelos-certificados/upload', formData);
        imagen = res.data.url;
        imagenSubida = imagen ?? null;
        setIsUploadingImage(false);
      }

      const data = {
        nombre,
        descripcion: descripcion || undefined,
        imagen,
        estado,
      };

      const fueExitosa = await onSave(data);

      if (fueExitosa) {
        // Solo borramos la imagen vieja del storage si el guardado fue exitoso
        if (selectedFile && imagenOriginal && imagenOriginal !== imagen) {
          await eliminarImagenAnterior(imagenOriginal);
        } else if (imagenOriginal && !imagenExistente && !selectedFile) {
          await eliminarImagenAnterior(imagenOriginal);
        }
        onClose();
      } else if (imagenSubida) {
        // El guardado falló pero ya subimos una imagen nueva: la limpiamos para no dejarla huérfana
        await eliminarImagenAnterior(imagenSubida);
      }
    } catch (error) {
      console.error('Error al guardar el modelo de certificado:', error);
      if (imagenSubida) {
        await eliminarImagenAnterior(imagenSubida);
      }
      alert('Ocurrió un error al subir la imagen o guardar los cambios.');
    } finally {
      setIsSaving(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Modelo de Certificado"
      maxWidth="max-w-5xl"
      footer={
        <>
          <div className="w-full md:w-[300px] md:mr-auto">
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
            disabled={isSaving || !!fileError}
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-sky-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isUploadingImage ? 'Subiendo imagen...' : 'Guardando...'}
              </>
            ) : (
              'Guardar Cambios'
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

            {imagenAMostrar && !imagenError ? (
              <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
                <img
                  src={imagenAMostrar}
                  alt="Vista previa"
                  className="w-full h-64 lg:h-full object-cover"
                  onError={() => setImagenError(true)}
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
                {previewUrl && (
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-white/80">
                    Se subirá al guardar
                  </span>
                )}
              </div>
            ) : (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-64 lg:h-full min-h-[220px] border-2 border-dashed rounded-2xl cursor-pointer transition-all bg-slate-50/50 ${
                  isDragging
                    ? 'border-sky-500 bg-sky-50/60'
                    : 'border-gray-200 hover:border-sky-400 hover:bg-sky-50/30'
                }`}
              >
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
                  {imagenError ? 'Imagen no disponible — subir nueva' : 'Subir plantilla'}
                </span>
                <span className="text-[10px] text-gray-400 mt-1">
                  JPG, PNG o WEBP · máx. {MAX_FILE_SIZE_MB}MB
                </span>
              </label>
            )}

            {fileError && (
              <div className="mt-2 flex items-center gap-2 text-rose-500 text-[11px] font-bold">
                <FaExclamationCircle size={12} />
                {fileError}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminModal>
  );
};