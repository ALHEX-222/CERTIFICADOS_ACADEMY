'use client';

import { useEffect, useState } from 'react';
import {
  IoClose,
  IoSearchOutline,
  IoDownloadOutline,
  IoCheckmarkCircle,
  IoImageOutline,
  IoDocumentsOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoAlertCircle,
  IoSquareOutline,
  IoCheckboxOutline,
} from 'react-icons/io5';
import type { Certificado, Curso } from '../../types/models';
import { apiClient } from '../../services/apiClient';
import { resolveAvatarUrl } from '../../config/api';

export interface ModeloCertificado {
  id_modelo: number;
  nombre: string;
  orientacion?: string;
  estado?: string;
  descripcion?: string | null;
  imagen?: string | null;
  campos_config?: string | null;
}

function normalizarCertificado(raw: any): Certificado {
  const estudiante = raw?.estudiante ?? {};
  const curso = raw?.curso ?? {};
  return {
    ...raw,
    id_estudiante: raw?.id_estudiante ?? estudiante?.id_estudiante,
    id_curso: raw?.id_curso ?? curso?.id_curso,
    nombre_estudiante: raw?.nombre_estudiante ?? estudiante?.nombre_completo ?? '',
    dni_estudiante: raw?.dni_estudiante ?? estudiante?.numero_documento ?? '',
    nombre_curso: raw?.nombre_curso ?? curso?.nombre ?? '',
  } as Certificado;
}

type Paso = 'seleccion' | 'diseno' | 'modo';
type ModoDescarga = 'unico' | 'separado';

const STEPS: { key: Paso; label: string }[] = [
  { key: 'seleccion', label: 'Seleccionar' },
  { key: 'diseno', label: 'Diseño' },
  { key: 'modo', label: 'Descargar' },
];

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function dispararDescargaBlob(blob: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function nombreDesdeContentDisposition(
  contentDisposition: string | undefined,
  fallback: string,
): string {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] || fallback;
}

export function DescargaCertificadosModal({
  isOpen,
  onClose,
  cursos,
}: {
  isOpen: boolean;
  onClose: () => void;
  cursos: Curso[];
}) {
  const [paso, setPaso] = useState<Paso>('seleccion');

  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState<number | ''>('');
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());

  const [modelos, setModelos] = useState<ModeloCertificado[]>([]);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [modeloSeleccionado, setModeloSeleccionado] = useState<number | ''>('');

  const [modoDescarga, setModoDescarga] = useState<ModoDescarga>('separado');
  const [descargando, setDescargando] = useState(false);
  const [progreso, setProgreso] = useState<{ actual: number; total: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda.trim()), 400);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    if (!isOpen) return;
    let activo = true;
    setLoadingCerts(true);
    apiClient
      .get('/certificados', {
        params: {
          page: 1,
          perPage: 500,
          ...(busquedaDebounced ? { busqueda: busquedaDebounced } : {}),
          ...(cursoFiltro
            ? {
                cursoId: cursoFiltro,
                id_curso: cursoFiltro,
                curso: cursoFiltro,
              }
            : {}),
        },
      })
      .then((res) => {
        if (!activo) return;
        const raw = res.data;
        const lista: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        setCertificados(lista.map(normalizarCertificado));
      })
      .catch((err) => console.error('Error cargando certificados:', err))
      .finally(() => activo && setLoadingCerts(false));
    return () => {
      activo = false;
    };
  }, [isOpen, busquedaDebounced, cursoFiltro]);

  useEffect(() => {
    if (!isOpen || paso !== 'diseno' || modelos.length > 0) return;
    setLoadingModelos(true);
    apiClient
      .get('/admin/modelos-certificados')
      .then((res) => {
        const raw = res.data;
        const lista: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        setModelos(lista);
      })
      .catch((err) => console.error('Error cargando modelos:', err))
      .finally(() => setLoadingModelos(false));
  }, [isOpen, paso, modelos.length]);

  // Filtro en cliente (por si el backend no aplica cursoId)
  const certificadosFiltrados =
    cursoFiltro === ''
      ? certificados
      : certificados.filter((c) => Number(c.id_curso) === Number(cursoFiltro));

  const reiniciar = () => {
    setPaso('seleccion');
    setBusqueda('');
    setBusquedaDebounced('');
    setCursoFiltro('');
    setSeleccionados(new Set());
    setModeloSeleccionado('');
    setModoDescarga('separado');
    setError('');
    setDescargando(false);
    setProgreso(null);
  };

  const cerrarModal = () => {
    reiniciar();
    onClose();
  };

  const toggleSeleccion = (id: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const todosSeleccionados =
    certificadosFiltrados.length > 0 &&
    certificadosFiltrados.every((c) => seleccionados.has(c.id_certificado));

  const toggleSeleccionarTodos = () => {
    setSeleccionados((prev) => {
      if (todosSeleccionados) {
        const next = new Set(prev);
        certificadosFiltrados.forEach((c) => next.delete(c.id_certificado));
        return next;
      }
      const next = new Set(prev);
      certificadosFiltrados.forEach((c) => next.add(c.id_certificado));
      return next;
    });
  };

  const cantidadSeleccionada = seleccionados.size;

  const puedeAvanzarPaso1 = cantidadSeleccionada > 0;
  const puedeAvanzarPaso2 = modeloSeleccionado !== '';

  const irSiguiente = () => {
    setError('');
    if (paso === 'seleccion') {
      if (!puedeAvanzarPaso1) return setError('Selecciona al menos un certificado.');
      setPaso('diseno');
    } else if (paso === 'diseno') {
      if (!puedeAvanzarPaso2) return setError('Elige un diseño de certificado.');
      setPaso('modo');
    }
  };

  const irAtras = () => {
    setError('');
    if (paso === 'diseno') setPaso('seleccion');
    else if (paso === 'modo') setPaso('diseno');
  };

  const descargarPdfUnico = async (ids: number[], idModelo: number) => {
    const res = await apiClient.post(
      '/certificados/descargar-masivo',
      { ids, id_modelo: idModelo },
      { responseType: 'blob' },
    );
    const nombreArchivo = nombreDesdeContentDisposition(
      (res.headers as any)?.['content-disposition'],
      'certificados.pdf',
    );
    dispararDescargaBlob(res.data as Blob, nombreArchivo);
  };

  const descargarPdfsSeparados = async (ids: number[], idModelo: number) => {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      setProgreso({ actual: i + 1, total: ids.length });

      const res = await apiClient.get(`/certificados/${id}/descargar`, {
        params: { id_modelo: idModelo },
        responseType: 'blob',
      });

      const nombreArchivo = nombreDesdeContentDisposition(
        (res.headers as any)?.['content-disposition'],
        `certificado-${id}.pdf`,
      );
      dispararDescargaBlob(res.data as Blob, nombreArchivo);

      if (i < ids.length - 1) await esperar(350);
    }
  };

  const handleDescargar = async () => {
    setError('');
    setDescargando(true);
    setProgreso(null);
    try {
      const ids = Array.from(seleccionados);
      const idModelo = Number(modeloSeleccionado);

      if (modoDescarga === 'unico') {
        await descargarPdfUnico(ids, idModelo);
      } else {
        await descargarPdfsSeparados(ids, idModelo);
      }

      cerrarModal();
    } catch (err) {
      console.error('Error en descarga de certificados:', err);
      setError('Ocurrió un error al generar la descarga. Intenta nuevamente.');
    } finally {
      setDescargando(false);
      setProgreso(null);
    }
  };

  if (!isOpen) return null;

  const stepIndex = STEPS.findIndex((s) => s.key === paso);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative animate-fadeIn overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] flex items-center justify-center">
              <IoDownloadOutline size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                Descargar Certificados
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                {STEPS[stepIndex].label} · Paso {stepIndex + 1} de {STEPS.length}
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

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-8 pt-5 flex-shrink-0">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div
                className={`h-1.5 rounded-full flex-1 transition-all ${
                  i <= stepIndex ? 'bg-sky-500' : 'bg-slate-100'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {paso === 'seleccion' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <IoSearchOutline
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por código, alumno, DNI o curso..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-sm font-medium text-slate-900"
                  />
                </div>

                <select
                  value={cursoFiltro}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    setCursoFiltro(val);
                    setSeleccionados(new Set());
                  }}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 min-w-[200px]"
                >
                  <option value="">Todos los cursos</option>
                  {cursos.map((c) => (
                    <option key={c.id_curso} value={c.id_curso}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={toggleSeleccionarTodos}
                  className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-700"
                >
                  {todosSeleccionados ? (
                    <IoCheckboxOutline size={18} />
                  ) : (
                    <IoSquareOutline size={18} />
                  )}
                  Seleccionar todos ({certificadosFiltrados.length})
                </button>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {cantidadSeleccionada} seleccionado
                  {cantidadSeleccionada !== 1 ? 's' : ''}
                  {cursoFiltro !== '' && (
                    <span className="ml-2 text-sky-600">
                      ·{' '}
                      {cursos.find((c) => c.id_curso === cursoFiltro)?.nombre ||
                        'Curso'}
                    </span>
                  )}
                </span>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-[360px] overflow-y-auto">
                {loadingCerts ? (
                  <div className="p-10 text-center">
                    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : certificadosFiltrados.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 font-medium italic text-sm">
                    No se encontraron certificados
                    {cursoFiltro !== '' ? ' para este curso' : ''}.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {certificadosFiltrados.map((c) => {
                      const checked = seleccionados.has(c.id_certificado);
                      return (
                        <label
                          key={c.id_certificado}
                          className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors ${
                            checked ? 'bg-sky-50/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSeleccion(c.id_certificado)}
                            className="w-4 h-4 rounded accent-sky-600 flex-shrink-0"
                          />
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                            <IoPersonOutline size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-700 truncate">
                              {c.nombre_estudiante}
                            </p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">
                              {c.codigo_certificado} · {c.nombre_curso}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {paso === 'diseno' && (
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Elige el diseño con el que se generarán los {cantidadSeleccionada}{' '}
                certificados
              </p>

              {loadingModelos ? (
                <div className="p-10 text-center">
                  <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : modelos.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-medium italic text-sm border border-slate-100 rounded-2xl">
                  No hay modelos de certificado registrados aún.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {modelos.map((m) => {
                    const seleccionado = modeloSeleccionado === m.id_modelo;
                    const imagenSrc = resolveAvatarUrl(m.imagen);
                    return (
                      <button
                        key={m.id_modelo}
                        type="button"
                        onClick={() => setModeloSeleccionado(m.id_modelo)}
                        className={`relative flex flex-col rounded-2xl border-2 overflow-hidden text-left transition-all ${
                          seleccionado
                            ? 'border-sky-500 shadow-lg shadow-sky-500/10'
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        {seleccionado && (
                          <div className="absolute top-2 right-2 text-sky-500 bg-white rounded-full z-10">
                            <IoCheckmarkCircle size={22} />
                          </div>
                        )}
                        <div
                          className={`bg-slate-50 flex items-center justify-center ${
                            m.orientacion === 'vertical'
                              ? 'aspect-[3/4]'
                              : 'aspect-[4/3]'
                          }`}
                        >
                          {imagenSrc ? (
                            <img
                              src={imagenSrc}
                              alt={m.nombre}
                              className="w-full h-full object-cover"
                              onError={(ev) => {
                                const target = ev.target as HTMLImageElement;
                                target.onerror = null;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <IoImageOutline size={32} className="text-slate-300" />
                          )}
                        </div>
                        <div className="px-3 py-2.5 bg-white">
                          <p className="text-xs font-black text-slate-700 truncate">
                            {m.nombre}
                          </p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                            {m.orientacion || 'horizontal'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {paso === 'modo' && (
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                ¿Cómo quieres generar los archivos PDF?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setModoDescarga('unico')}
                  className={`flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all ${
                    modoDescarga === 'unico'
                      ? 'border-sky-500 bg-sky-50/50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                    <IoDocumentTextOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Un solo PDF</p>
                    <p className="text-[11px] text-slate-400 font-semibold mt-1">
                      Todos los certificados seleccionados en un único archivo, cada uno
                      en una página distinta.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setModoDescarga('separado')}
                  className={`flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all ${
                    modoDescarga === 'separado'
                      ? 'border-sky-500 bg-sky-50/50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                    <IoDocumentsOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Varios PDF</p>
                    <p className="text-[11px] text-slate-400 font-semibold mt-1">
                      Cada certificado se descarga como un archivo PDF independiente.
                    </p>
                  </div>
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-[11px] text-slate-500 font-medium">
                {modoDescarga === 'unico' ? (
                  <>
                    Se descargará <strong>1 archivo PDF</strong> con{' '}
                    {cantidadSeleccionada} página
                    {cantidadSeleccionada !== 1 ? 's' : ''} (una por certificado).
                  </>
                ) : (
                  <>
                    Se descargarán <strong>{cantidadSeleccionada}</strong> archivo
                    {cantidadSeleccionada !== 1 ? 's' : ''} PDF independientes, uno por
                    certificado.
                  </>
                )}
              </div>

              {descargando && progreso && (
                <div className="text-[11px] font-bold text-sky-600 text-center">
                  Descargando {progreso.actual} de {progreso.total}...
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 mt-4">
              <IoAlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-8 py-5 border-t border-slate-100 flex-shrink-0">
          <div>
            {paso !== 'seleccion' && (
              <button
                onClick={irAtras}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
              >
                <IoArrowBackOutline size={14} /> Atrás
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cerrarModal}
              className="rounded-2xl border border-slate-200 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>

            {paso !== 'modo' ? (
              <button
                onClick={irSiguiente}
                className="flex items-center gap-2 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95"
              >
                Siguiente <IoArrowForwardOutline size={14} />
              </button>
            ) : (
              <button
                onClick={handleDescargar}
                disabled={descargando}
                className="flex items-center gap-2 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <IoDownloadOutline size={16} />
                {descargando ? 'Generando...' : 'Descargar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DescargaCertificadosModal;