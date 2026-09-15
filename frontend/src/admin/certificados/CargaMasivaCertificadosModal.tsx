'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  IoClose,
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoWarningOutline,
} from 'react-icons/io5';
import { apiClient } from '../../services/apiClient';

interface ResultadoCargaMasiva {
  total_filas: number;
  certificados_creados: number;
  estudiantes_creados: number;
  cursos_creados: number;
  errores: { fila: number; mensaje: string }[];
}

type Paso = 'seleccion' | 'enviando' | 'resultado';

export function CargaMasivaCertificadosModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [paso, setPaso] = useState<Paso>('seleccion');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [resultado, setResultado] = useState<ResultadoCargaMasiva | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reiniciar = useCallback(() => {
    setPaso('seleccion');
    setArchivo(null);
    setErrorGeneral('');
    setResultado(null);
  }, []);

  const cerrarModal = () => {
    reiniciar();
    onClose();
  };

  const seleccionarArchivo = (file: File) => {
    setErrorGeneral('');
    setArchivo(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) seleccionarArchivo(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) seleccionarArchivo(file);
  };

  const confirmarCarga = async () => {
    if (!archivo) return;

    setPaso('enviando');
    setErrorGeneral('');

    try {
      const formData = new FormData();
      formData.append('archivo', archivo);

      const res = await apiClient.post('/certificados/carga-masiva', formData);
      setResultado(res.data as ResultadoCargaMasiva);
      setPaso('resultado');
      onSuccess?.();
    } catch (err: unknown) {
      console.error('Error en carga masiva:', err);
      const mensaje =
        err && typeof err === 'object' && 'response' in err
          ? (err as any)?.response?.data?.message
          : null;
      setErrorGeneral(mensaje || 'Ocurrió un error al enviar el archivo al servidor.');
      setPaso('seleccion');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative animate-fadeIn overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] flex items-center justify-center">
              <IoCloudUploadOutline size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                Carga Masiva de Certificados
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                Importar desde Excel
              </p>
            </div>
          </div>
          <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-700 transition-colors">
            <IoClose size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {paso === 'seleccion' && (
            <div className="flex flex-col gap-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setArrastrando(true);
                }}
                onDragLeave={() => setArrastrando(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-[1.75rem] py-16 px-6 cursor-pointer transition-all ${
                  arrastrando
                    ? 'border-sky-500 bg-sky-50/60'
                    : 'border-slate-200 bg-slate-50/50 hover:border-sky-400 hover:bg-sky-50/30'
                }`}
              >
                <IoCloudUploadOutline size={40} className="text-sky-500" />
                <div className="text-center">
                  <p className="text-sm font-black text-slate-700">
                    Arrastra tu archivo aquí o haz clic para seleccionarlo
                  </p>
                  <p className="text-[11px] text-slate-400 font-bold mt-1">
                    Formato soportado: .xlsx
                  </p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>

              {archivo && (
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
                  <IoDocumentTextOutline size={20} className="text-sky-500 flex-shrink-0" />
                  <span className="text-xs font-black text-slate-700 truncate">{archivo.name}</span>
                </div>
              )}

              {errorGeneral && (
                <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4">
                  <IoAlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-rose-700">{errorGeneral}</p>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Columnas reconocidas
                </p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  nombre_completo (o nombres + apellidos), numero_documento (o dni/documento), curso
                  (o nombre_curso), email, horas, fecha_inicio, fecha_fin, calificacion_final. Solo
                  nombre, documento y curso son obligatorios; estudiantes y cursos nuevos se crean
                  automáticamente.
                </p>
              </div>
            </div>
          )}

          {paso === 'enviando' && (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                Procesando archivo...
              </span>
            </div>
          )}

          {paso === 'resultado' && resultado && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-slate-900">{resultado.total_filas}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                    Filas
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-emerald-600">
                    {resultado.certificados_creados}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-1">
                    Creados
                  </p>
                </div>
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-sky-600">{resultado.estudiantes_creados}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-sky-500 mt-1">
                    Estudiantes nuevos
                  </p>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-rose-600">{resultado.errores.length}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mt-1">
                    Errores
                  </p>
                </div>
              </div>

              {resultado.errores.length > 0 && (
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="max-h-[280px] overflow-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr>
                          <th className="px-4 py-3 font-black text-slate-500 uppercase tracking-widest text-[9px]">
                            Fila
                          </th>
                          <th className="px-4 py-3 font-black text-slate-500 uppercase tracking-widest text-[9px]">
                            Error
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {resultado.errores.map((e, i) => (
                          <tr key={i} className="bg-rose-50/40">
                            <td className="px-4 py-3 font-bold text-slate-400">{e.fila}</td>
                            <td className="px-4 py-3 text-rose-600 font-semibold">
                              <span className="inline-flex items-center gap-1">
                                <IoWarningOutline size={14} /> {e.mensaje}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {resultado.errores.length === 0 && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                  <IoCheckmarkCircle size={20} className="text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-700">
                    Todas las filas se procesaron correctamente.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={cerrarModal}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
          >
            {paso === 'resultado' ? 'Cerrar' : 'Cancelar'}
          </button>

          {paso === 'seleccion' && (
            <button
              onClick={confirmarCarga}
              disabled={!archivo}
              className="flex items-center gap-2 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IoCloudUploadOutline size={16} />
              Subir Archivo
            </button>
          )}

          {paso === 'resultado' && (
            <button
              onClick={reiniciar}
              className="flex items-center gap-2 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95"
            >
              <IoCloudUploadOutline size={16} />
              Cargar otro archivo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CargaMasivaCertificadosModal;