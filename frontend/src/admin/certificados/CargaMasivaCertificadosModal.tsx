'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  IoClose,
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoWarningOutline,
  IoEyeOutline,
} from 'react-icons/io5';
import * as XLSX from 'xlsx';
import { apiClient } from '../../services/apiClient';

interface ResultadoCargaMasiva {
  total_filas: number;
  certificados_creados: number;
  estudiantes_creados: number;
  cursos_creados: number;
  errores: { fila: number; mensaje: string }[];
}

interface FilaPreview {
  fila: number;
  nombre: string;
  documento: string;
  curso: string;
  email: string;
  horas: string;
  fecha_inicio: string;
  fecha_fin: string;
  calificacion: string;
  valido: boolean;
  error?: string;
}

type Paso = 'seleccion' | 'preview' | 'enviando' | 'resultado';

function normalizarHeader(h: string): string {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function parseExcel(file: File): Promise<FilaPreview[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: '',
          raw: false,
        });

        if (!rows.length) {
          resolve([]);
          return;
        }

        const headers = (rows[0] as string[]).map(normalizarHeader);
        const idx = (keys: string[]) => {
          for (const k of keys) {
            const i = headers.indexOf(k);
            if (i >= 0) return i;
          }
          return -1;
        };

        const iNombre = idx(['nombre_completo', 'nombre']);
        const iNombres = idx(['nombres']);
        const iApellidos = idx(['apellidos']);
        const iDoc = idx(['numero_documento', 'dni', 'documento']);
        const iCurso = idx(['curso', 'nombre_curso']);
        const iEmail = idx(['email', 'correo']);
        const iHoras = idx(['horas']);
        const iInicio = idx(['fecha_inicio']);
        const iFin = idx(['fecha_fin']);
        const iCalif = idx(['calificacion_final', 'calificacion']);

        const preview: FilaPreview[] = [];

        for (let r = 1; r < rows.length; r++) {
          const row = rows[r] as string[];
          if (!row || row.every((c) => !String(c).trim())) continue;

          let nombre = iNombre >= 0 ? String(row[iNombre] || '').trim() : '';
          if (!nombre && iNombres >= 0 && iApellidos >= 0) {
            nombre = `${String(row[iNombres] || '').trim()} ${String(row[iApellidos] || '').trim()}`.trim();
          }
          const documento = iDoc >= 0 ? String(row[iDoc] || '').trim() : '';
          const curso = iCurso >= 0 ? String(row[iCurso] || '').trim() : '';
          const email = iEmail >= 0 ? String(row[iEmail] || '').trim() : '';
          const horas = iHoras >= 0 ? String(row[iHoras] || '').trim() : '';
          const fecha_inicio = iInicio >= 0 ? String(row[iInicio] || '').trim() : '';
          const fecha_fin = iFin >= 0 ? String(row[iFin] || '').trim() : '';
          const calificacion = iCalif >= 0 ? String(row[iCalif] || '').trim() : '';

          let error: string | undefined;
          if (!nombre || !documento || !curso) {
            error = 'Faltan datos obligatorios (nombre, documento o curso)';
          }

          preview.push({
            fila: r + 1,
            nombre,
            documento,
            curso,
            email,
            horas,
            fecha_inicio,
            fecha_fin,
            calificacion,
            valido: !error,
            error,
          });
        }

        resolve(preview);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
}

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
  const [preview, setPreview] = useState<FilaPreview[]>([]);
  const [leyendo, setLeyendo] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [resultado, setResultado] = useState<ResultadoCargaMasiva | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reiniciar = useCallback(() => {
    setPaso('seleccion');
    setArchivo(null);
    setPreview([]);
    setErrorGeneral('');
    setResultado(null);
    setLeyendo(false);
  }, []);

  const cerrarModal = () => {
    reiniciar();
    onClose();
  };

  const seleccionarArchivo = async (file: File) => {
    setErrorGeneral('');
    setArchivo(file);
    setLeyendo(true);
    try {
      const filas = await parseExcel(file);
      if (filas.length === 0) {
        setErrorGeneral('El archivo no tiene filas de datos (solo encabezados o vacío).');
        setPreview([]);
        setPaso('seleccion');
      } else {
        setPreview(filas);
        setPaso('preview');
      }
    } catch {
      setErrorGeneral('No se pudo leer el Excel. Verifica que sea un .xlsx válido.');
      setPreview([]);
      setPaso('seleccion');
    } finally {
      setLeyendo(false);
    }
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
      setErrorGeneral(
        mensaje || 'Ocurrió un error al enviar el archivo al servidor.',
      );
      setPaso('preview');
    }
  };

  if (!isOpen) return null;

  const validas = preview.filter((f) => f.valido).length;
  const invalidas = preview.filter((f) => !f.valido).length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col relative animate-fadeIn overflow-hidden">
        {/* Header */}
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
                {paso === 'preview'
                  ? 'Vista previa'
                  : paso === 'resultado'
                  ? 'Resultado'
                  : 'Importar desde Excel'}
              </p>
            </div>
          </div>
          <button
            onClick={cerrarModal}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* SELECCIÓN */}
          {paso === 'seleccion' && (
            <div className="flex flex-col gap-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setArrastrando(true);
                }}
                onDragLeave={() => setArrastrando(false)}
                onDrop={handleDrop}
                onClick={() => !leyendo && inputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-[1.75rem] py-16 px-6 cursor-pointer transition-all ${
                  arrastrando
                    ? 'border-sky-500 bg-sky-50/60'
                    : 'border-slate-200 bg-slate-50/50 hover:border-sky-400 hover:bg-sky-50/30'
                }`}
              >
                {leyendo ? (
                  <>
                    <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-500">Leyendo archivo...</p>
                  </>
                ) : (
                  <>
                    <IoCloudUploadOutline size={40} className="text-sky-500" />
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-700">
                        Arrastra tu archivo aquí o haz clic para seleccionarlo
                      </p>
                      <p className="text-[11px] text-slate-400 font-bold mt-1">
                        Formato soportado: .xlsx
                      </p>
                    </div>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>

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
                  nombre_completo (o nombres + apellidos), numero_documento (o dni/documento),
                  curso (o nombre_curso), email, horas, fecha_inicio, fecha_fin,
                  calificacion_final. Solo nombre, documento y curso son obligatorios;
                  estudiantes y cursos nuevos se crean automáticamente.
                </p>
              </div>
            </div>
          )}

          {/* PREVIEW */}
          {paso === 'preview' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                  <IoDocumentTextOutline size={16} className="text-sky-500" />
                  <span className="text-xs font-black text-slate-700 truncate max-w-[200px]">
                    {archivo?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  <span className="text-xs font-black text-emerald-600">
                    {validas} válidas
                  </span>
                </div>
                {invalidas > 0 && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                    <span className="text-xs font-black text-rose-600">
                      {invalidas} con error
                    </span>
                  </div>
                )}
                <span className="text-[11px] font-bold text-slate-400 ml-auto">
                  {preview.length} fila{preview.length !== 1 ? 's' : ''} en total
                </span>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="max-h-[380px] overflow-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr>
                        <th className="px-3 py-3 font-black text-slate-500 uppercase tracking-widest text-[9px] w-12">
                          #
                        </th>
                        <th className="px-3 py-3 font-black text-slate-500 uppercase tracking-widest text-[9px]">
                          Nombre
                        </th>
                        <th className="px-3 py-3 font-black text-slate-500 uppercase tracking-widest text-[9px]">
                          Documento
                        </th>
                        <th className="px-3 py-3 font-black text-slate-500 uppercase tracking-widest text-[9px]">
                          Curso
                        </th>
                        <th className="px-3 py-3 font-black text-slate-500 uppercase tracking-widest text-[9px] hidden md:table-cell">
                          Email
                        </th>
                        <th className="px-3 py-3 font-black text-slate-500 uppercase tracking-widest text-[9px] w-16">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {preview.map((f) => (
                        <tr
                          key={f.fila}
                          className={f.valido ? 'hover:bg-slate-50/80' : 'bg-rose-50/50'}
                        >
                          <td className="px-3 py-2.5 font-bold text-slate-400">{f.fila}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-700 max-w-[160px] truncate">
                            {f.nombre || '—'}
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-slate-600">
                            {f.documento || '—'}
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-slate-600 max-w-[140px] truncate">
                            {f.curso || '—'}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 hidden md:table-cell max-w-[140px] truncate">
                            {f.email || '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            {f.valido ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                <IoCheckmarkCircle size={14} /> OK
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-rose-600 font-bold"
                                title={f.error}
                              >
                                <IoWarningOutline size={14} /> Error
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {invalidas > 0 && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                  <IoWarningOutline size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-amber-800">
                    Hay {invalidas} fila{invalidas !== 1 ? 's' : ''} con datos incompletos.
                    El servidor las marcará como error; las válidas sí se procesarán.
                  </p>
                </div>
              )}

              {errorGeneral && (
                <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4">
                  <IoAlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-rose-700">{errorGeneral}</p>
                </div>
              )}
            </div>
          )}

          {/* ENVIANDO */}
          {paso === 'enviando' && (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                Procesando archivo...
              </span>
            </div>
          )}

          {/* RESULTADO */}
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
                  <p className="text-2xl font-black text-sky-600">
                    {resultado.estudiantes_creados}
                  </p>
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

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-8 py-5 border-t border-slate-100 flex-shrink-0">
          <div>
            {paso === 'preview' && (
              <button
                onClick={reiniciar}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cambiar archivo
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cerrarModal}
              className="rounded-2xl border border-slate-200 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
            >
              {paso === 'resultado' ? 'Cerrar' : 'Cancelar'}
            </button>

            {paso === 'preview' && (
              <button
                onClick={confirmarCarga}
                disabled={validas === 0}
                className="flex items-center gap-2 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <IoCloudUploadOutline size={16} />
                Subir {validas} certificado{validas !== 1 ? 's' : ''}
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
    </div>
  );
}

export default CargaMasivaCertificadosModal;