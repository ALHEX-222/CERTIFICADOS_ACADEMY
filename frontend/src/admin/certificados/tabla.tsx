'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import {
  IoSearchOutline,
  IoAddOutline,
  IoCreateOutline,
  IoInformationCircleOutline,
  IoFilterOutline,
  IoTrashOutline,
  IoQrCodeOutline,
  IoClose,
  IoDownloadOutline,
  IoCloudUploadOutline,
} from 'react-icons/io5';
import { FaChevronDown } from 'react-icons/fa';
import type { Certificado, Curso, Estudiante } from '../../types/models';
import { InfoCertificadoModal } from './infoCertificados';
import { AddCertificadoModal } from './agregarCertificados';
import { EditCertificadoModal } from './editCertificados';
import { CargaMasivaCertificadosModal } from './CargaMasivaCertificadosModal';
import DeleteModal from '../components/DeleteModal';
import { apiClient } from '../../services/apiClient';

function parseList<T>(j: any): T[] {
  if (Array.isArray(j)) return j;
  if (Array.isArray(j?.data)) return j.data;
  return [];
}

function formatearFechaSinTZ(
  fechaISO?: string | null,
  opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' },
): string {
  if (!fechaISO) return '—';
  const soloFecha = fechaISO.slice(0, 10);
  const [y, m, d] = soloFecha.split('-').map(Number);
  if (!y || !m || !d) return '—';
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', opts);
}

function FiltroCurso({
  value,
  onChange,
  cursos,
}: {
  value: number | '';
  onChange: (v: number | '') => void;
  cursos: Curso[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = cursos.find((c) => c.id_curso === value);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300 group shadow-sm w-full sm:w-auto"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors truncate">
          {current ? current.nombre : 'Todos los cursos'}
        </span>
        <FaChevronDown
          className={`text-slate-400 transition-transform duration-300 ml-auto ${open ? 'rotate-180 text-sky-500' : ''}`}
          size={10}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-3 w-72 max-h-80 overflow-y-auto bg-white rounded-[1.5rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50">
          <button
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest mb-1 ${
              value === '' ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos los cursos
          </button>
          {cursos.map((c) => (
            <button
              key={c.id_curso}
              onClick={() => {
                onChange(c.id_curso);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold mb-1 truncate ${
                value === c.id_curso ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QRCertificadoModal({
  isOpen,
  onClose,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: Certificado | null;
}) {
  if (!isOpen || !item) return null;

  const verificationUrl = `${window.location.origin}/consulta?codigo=${item.codigo_certificado}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(
    verificationUrl,
  )}`;

  const handleDownload = async () => {
    try {
      const res = await fetch(qrImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR-${item.codigo_certificado}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando QR:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <IoClose size={22} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-1 text-sky-600">
            <IoQrCodeOutline size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Código QR de Verificación
            </span>
          </div>

          <h3 className="text-lg font-black text-slate-900 mb-1">{item.codigo_certificado}</h3>
          <p className="text-xs text-slate-400 font-bold mb-6">
            {item.nombre_estudiante} · {item.nombre_curso}
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
            <img
              src={qrImageUrl}
              alt={`QR ${item.codigo_certificado}`}
              width={220}
              height={220}
              className="rounded-lg"
            />
          </div>

          <p className="text-[10px] text-slate-400 font-medium mb-6 break-all px-2">
            {verificationUrl}
          </p>

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95"
          >
            <IoDownloadOutline size={16} />
            Descargar QR
          </button>
        </div>
      </div>
    </div>
  );
}

export function Certificados() {
  const [items, setItems] = useState<Certificado[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCargaMasivaOpen, setIsCargaMasivaOpen] = useState(false);
  const [selected, setSelected] = useState<Certificado | null>(null);
  const [certToEdit, setCertToEdit] = useState<Certificado | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState<Certificado | null>(null);

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [certForQr, setCertForQr] = useState<Certificado | null>(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [busquedaDebounced, setBusquedaDebounced] = useState(busqueda);

  useEffect(() => {
    const handler = setTimeout(() => {
      setBusquedaDebounced(busqueda.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [busqueda]);

  const fetchAuxiliares = async () => {
    try {
      const [resC, resE] = await Promise.all([
        apiClient.get('/cursos'),
        apiClient.get('/estudiantes'),
      ]);
      setCursos(parseList<Curso>(resC.data));
      setEstudiantes(parseList<Estudiante>(resE.data));
    } catch (err) {
      console.error('Error cargando cursos/estudiantes:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get('/certificados', {
        params: {
          page,
          perPage: 20,
          ...(busquedaDebounced ? { busqueda: busquedaDebounced } : {}),
          ...(cursoFiltro ? { cursoId: cursoFiltro } : {}),
        },
      });

      const response = result.data;
      setItems(response?.data ?? []);
      setTotal(response?.total ?? 0);
      setLastPage(response?.lastPage ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuxiliares();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, cursoFiltro, busquedaDebounced]);

  const handleVerInfo = (c: Certificado) => {
    setSelected(c);
    setIsInfoOpen(true);
  };

  const handleVerQr = (c: Certificado) => {
    setCertForQr(c);
    setIsQrOpen(true);
  };

  const handleEditar = (c: Certificado) => {
    setCertToEdit(c);
    setIsEditModalOpen(true);
  };

  const handleEliminar = async () => {
    if (!certToDelete) return;
    try {
      await apiClient.delete(`/certificados/${certToDelete.id_certificado}`);
      if (items.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchData();
      }
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error eliminando certificado.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md group">
          <IoSearchOutline
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código, alumno, DNI o curso..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-sm text-slate-900 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCargaMasivaOpen(true)}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:border-sky-400 hover:shadow-md transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            <IoCloudUploadOutline size={18} />
            Emite con Excel
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5 shadow-md flex items-center gap-2 group whitespace-nowrap"
          >
            <IoAddOutline size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            Emitir Certificado
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 bg-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-2.5 px-5 py-3 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-200/50 w-full sm:w-auto justify-center sm:justify-start">
          <IoFilterOutline size={18} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Filtrar por
          </span>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block" />

        <FiltroCurso
          value={cursoFiltro}
          onChange={(v) => {
            setCursoFiltro(v);
            setPage(1);
          }}
          cursos={cursos}
        />
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Certificado
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Titular
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Curso
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">
                  Emisión
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                        Sincronizando certificados...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium italic">
                    No se encontraron certificaciones
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr
                    key={c.id_certificado}
                    className="group hover:bg-slate-50/80 transition-all duration-500"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight leading-tight uppercase">
                          {c.codigo_certificado}
                        </span>
                        <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border w-fit bg-sky-500/10 text-sky-600 border-sky-500/20">
                          {c.tipo_certificado}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs border border-white shadow-sm">
                          {c.nombre_estudiante?.charAt(0) || 'E'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 tracking-tight leading-tight">
                            {c.nombre_estudiante}
                          </span>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                            DNI: {c.dni_estudiante || '—'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[13px] font-black text-slate-600 group-hover:text-slate-900 transition-colors truncate max-w-xs">
                        {c.nombre_curso}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-black text-slate-900 leading-none">
                          {formatearFechaSinTZ(c.fecha_emision)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {c.fecha_emision ? c.fecha_emision.slice(0, 4) : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                        <button
                          onClick={() => handleVerInfo(c)}
                          className="p-2.5 rounded-xl text-sky-500 hover:bg-sky-50 transition-all"
                          title="Ver Detalles"
                        >
                          <IoInformationCircleOutline size={18} />
                        </button>
                        <button
                          onClick={() => handleVerQr(c)}
                          className="p-2.5 rounded-xl text-indigo-500 hover:bg-indigo-50 transition-all"
                          title="Generar QR"
                        >
                          <IoQrCodeOutline size={18} />
                        </button>
                        <button
                          onClick={() => handleEditar(c)}
                          className="p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 transition-all"
                          title="Editar"
                        >
                          <IoCreateOutline size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setCertToDelete(c);
                            setIsDeleteOpen(true);
                          }}
                          className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
                          title="Eliminar"
                        >
                          <IoTrashOutline size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-10 text-center">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">
                Sincronizando...
              </span>
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-medium italic">
              Sin certificaciones registradas
            </div>
          ) : (
            items.map((c) => (
              <div key={c.id_certificado} className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-black text-slate-900 leading-tight tracking-tight uppercase">
                      {c.codigo_certificado}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border bg-sky-500/10 text-sky-600 border-sky-500/20 w-fit">
                      {c.tipo_certificado}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900">
                      {formatearFechaSinTZ(c.fecha_emision, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 font-black shadow-sm border border-slate-100 flex-shrink-0">
                    {c.nombre_estudiante?.charAt(0) || 'E'}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-700 leading-tight truncate">
                      {c.nombre_estudiante}
                    </span>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">
                      {c.nombre_curso}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                  <button onClick={() => handleVerInfo(c)} className="p-2.5 text-sky-500 flex-1 flex justify-center">
                    <IoInformationCircleOutline size={20} />
                  </button>
                  <button onClick={() => handleVerQr(c)} className="p-2.5 text-indigo-500 flex-1 flex justify-center">
                    <IoQrCodeOutline size={20} />
                  </button>
                  <button onClick={() => handleEditar(c)} className="p-2.5 text-amber-500 flex-1 flex justify-center">
                    <IoCreateOutline size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setCertToDelete(c);
                      setIsDeleteOpen(true);
                    }}
                    className="p-2.5 text-rose-500 flex-1 flex justify-center"
                  >
                    <IoTrashOutline size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-white px-6 py-5">
            <p className="text-xs font-bold text-slate-400">
              Página {page} de {lastPage} · {total} certificados
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white">{page}</span>
              <button
                disabled={page >= lastPage}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <InfoCertificadoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} item={selected} />
      <QRCertificadoModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} item={certForQr} />

      <AddCertificadoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        cursos={cursos}
        estudiantes={estudiantes}
        onSave={async (data) => {
          try {
            await apiClient.post('/certificados', data);
            await fetchData();
            await fetchAuxiliares();
            return true;
          } catch (error) {
            console.error(error);
            return false;
          }
        }}
      />

      {isEditModalOpen && certToEdit && (
        <EditCertificadoModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          item={certToEdit}
          cursos={cursos}
          onSave={async (data) => {
            try {
              await apiClient.patch(`/certificados/${certToEdit.id_certificado}`, data);
              await fetchData();
              return true;
            } catch (error) {
              console.error(error);
              return false;
            }
          }}
        />
      )}

      <CargaMasivaCertificadosModal
        isOpen={isCargaMasivaOpen}
        onClose={() => setIsCargaMasivaOpen(false)}
        onSuccess={fetchData}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleEliminar}
        itemName={certToDelete?.codigo_certificado || 'este certificado'}
      />
    </div>
  );
}

export default Certificados;