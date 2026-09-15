'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaInfoCircle, FaPlus, FaEdit, FaArchive, FaChevronDown } from 'react-icons/fa';
import type { Curso } from '../../types/models';
import { AddCursoModal } from './agregarCursos';
import { InfoCursoModal } from './infoCursos';
import { EditCursoModal } from './editCursos';
import { ArchiveModal } from '../components/ArchiveModal';
import DeleteModal from '../components/DeleteModal';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../hooks/useToast';

const PER_PAGE = 12;

function FiltroEstado({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: '' | 'Activo' | 'Inactivo') => void;
}) {
  const [open, setOpen] = useState(false);

  const estados = [
    { value: '', label: 'Todos los estados', color: 'text-sky-600', bg: 'bg-sky-50' },
    { value: 'Activo', label: 'Activo', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { value: 'Inactivo', label: 'Inactivo', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const current = estados.find((e) => e.value === value) || estados[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 group shadow-sm"
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${value === 'Activo' ? 'bg-emerald-500 animate-pulse' : value === 'Inactivo' ? 'bg-amber-500' : 'bg-sky-500'}`}
        />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors whitespace-nowrap">
          {current.label}
        </span>
        <FaChevronDown
          className={`text-slate-400 transition-transform duration-500 ${open ? 'rotate-180 text-sky-500' : ''}`}
          size={10}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.15)] border border-slate-100 p-2 z-50 overflow-hidden">
            {estados.map((e) => (
              <button
                key={e.value}
                onClick={() => {
                  onChange(e.value as any);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 flex items-center gap-3
                  ${
                    value === e.value
                      ? `${e.bg} ${e.color} shadow-sm`
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    e.value === 'Activo'
                      ? 'bg-emerald-500'
                      : e.value === 'Inactivo'
                        ? 'bg-amber-500'
                        : 'bg-sky-500'
                  }`}
                />
                {e.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface CursosProps {
  rol: number | null;
}

export function Cursos({ rol }: CursosProps) {
  const { showToast } = useToast();
  const esAdministrador = rol === 1;

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'' | 'Activo' | 'Inactivo'>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cursoAEditar, setCursoAEditar] = useState<Curso | null>(null);
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [cursoEstadoSeleccionado, setCursoEstadoSeleccionado] = useState<Curso | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cursoAEliminar, setCursoAEliminar] = useState<Curso | null>(null);
  const [pagina, setPagina] = useState(1);

  const fetchCursos = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/cursos');
      setCursos(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (error) {
      console.error('Error cargando cursos:', error);
      showToast('No se pudieron cargar los cursos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  const cursosFiltrados = cursos.filter((c) => {
    const coincideBusqueda =
      !busqueda.trim() ||
      c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = !filtroEstado || c.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const totalPaginas = Math.max(1, Math.ceil(cursosFiltrados.length / PER_PAGE));
  const cursosPagina = cursosFiltrados.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroEstado]);

  const crearCurso = async (
    nuevoCurso: Omit<Curso, 'id_curso' | 'created_at' | 'updated_at'>,
  ): Promise<boolean> => {
    try {
      const response = await apiClient.post('/cursos', nuevoCurso);
      if (response.data?.id_curso) {
        showToast('✅ Curso creado correctamente', 'success');
        fetchCursos();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error al crear curso:', error);
      const msg =
        error.response?.data?.message || error.response?.data?.mensaje || 'Error al crear curso.';
      showToast(Array.isArray(msg) ? msg[0] : msg, 'error');
      return false;
    }
  };

  const guardarEdicion = async (cursoActualizado: Curso): Promise<boolean> => {
    try {
      const { id_curso, created_at, updated_at, ...body } = cursoActualizado as any;
      const response = await apiClient.patch(`/cursos/${cursoActualizado.id_curso}`, body);

      if (response.data?.id_curso) {
        setCursos((prev) =>
          prev.map((c) => (c.id_curso === response.data.id_curso ? response.data : c)),
        );
        showToast('✅ Curso actualizado correctamente', 'success');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error al guardar edición:', error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.mensaje ||
        'Error al actualizar el curso.';
      showToast(Array.isArray(msg) ? msg[0] : msg, 'error');
      return false;
    }
  };

  const handleConfirmCambioEstado = async () => {
    if (!cursoEstadoSeleccionado) return;
    const nuevoEstado = cursoEstadoSeleccionado.estado === 'Activo' ? 'Inactivo' : 'Activo';

    try {
      await apiClient.patch(`/cursos/${cursoEstadoSeleccionado.id_curso}`, {
        estado: nuevoEstado,
      });

      setCursos((prev) =>
        prev.map((c) =>
          c.id_curso === cursoEstadoSeleccionado.id_curso ? { ...c, estado: nuevoEstado } : c,
        ),
      );

      showToast('✅ Estado actualizado', 'success');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showToast('No se pudo actualizar el estado', 'error');
    } finally {
      setCursoEstadoSeleccionado(null);
      setIsEstadoModalOpen(false);
    }
  };

  const handleEliminar = async () => {
    if (!cursoAEliminar) return;

    try {
      await apiClient.delete(`/cursos/${cursoAEliminar.id_curso}`);
      setCursos((prev) => prev.filter((c) => c.id_curso !== cursoAEliminar.id_curso));
      showToast('✅ Curso eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      showToast('Hubo un error al eliminar el curso.', 'error');
    } finally {
      setCursoAEliminar(null);
      setIsDeleteModalOpen(false);
    }
  };

  const abrirModalInfo = (curso: Curso) => {
    setCursoSeleccionado(curso);
    setModalAbierto(true);
  };

  const abrirModalEditar = (curso: Curso) => {
    setCursoAEditar(curso);
    setIsEditModalOpen(true);
  };

  const abrirModalEstado = (curso: Curso) => {
    setCursoEstadoSeleccionado(curso);
    setIsEstadoModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cursos por título o descripción..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-sm text-slate-900 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <FiltroEstado value={filtroEstado} onChange={setFiltroEstado} />

          {esAdministrador && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 border border-white/5 shadow-md flex items-center gap-2 group whitespace-nowrap"
            >
              <FaPlus size={14} className="group-hover:rotate-90 transition-transform duration-300" />{' '}
              Nuevo Curso
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Curso
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                  Duración
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-center">
                  Estado
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-500 font-medium tracking-tight uppercase text-[10px] font-black tracking-widest">
                        Cargando catálogo...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : cursosPagina.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-20 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest"
                  >
                    No se encontraron cursos
                  </td>
                </tr>
              ) : (
                cursosPagina.map((curso) => (
                  <tr
                    key={curso.id_curso}
                    className="group hover:bg-slate-50/50 transition-all duration-500 border-b border-slate-50 last:border-0"
                  >
                    <td className="px-8 py-7">
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="text-[16px] font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight leading-none">
                          {curso.nombre}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                            ID: #{curso.id_curso}
                          </span>
                          {curso.descripcion && (
                            <span className="text-[11px] text-slate-400 truncate max-w-[280px]">
                              {curso.descripcion}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <span className="text-[13px] font-bold text-slate-700">
                        {curso.duracion || '—'}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex justify-center">
                        <div
                          className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] border transition-all duration-500 shadow-sm
                            ${
                              curso.estado === 'Activo'
                                ? 'bg-white text-emerald-600 border-emerald-100 group-hover:border-emerald-500/30 group-hover:bg-emerald-50/30'
                                : 'bg-white text-amber-600 border-amber-100 group-hover:border-amber-500/30 group-hover:bg-amber-50/30'
                            }
                          `}
                        >
                          <div
                            className={`w-2 h-2 rounded-full animate-pulse ${curso.estado === 'Activo' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'}`}
                          />
                          {curso.estado}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="inline-flex items-center bg-white p-1 rounded-2xl border border-slate-100 shadow-sm transition-all duration-500">
                        <button
                          onClick={() => abrirModalEditar(curso)}
                          className="p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 transition-all duration-300"
                          title="Editar"
                        >
                          <FaEdit size={16} className="hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => abrirModalEstado(curso)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-300"
                          title={curso.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                        >
                          <FaArchive size={16} className="hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => abrirModalInfo(curso)}
                          className="p-2.5 rounded-xl text-sky-500 hover:bg-sky-50 transition-all duration-300"
                          title="Ver detalles"
                        >
                          <FaInfoCircle size={16} className="hover:scale-110 transition-transform" />
                        </button>
                        {esAdministrador && (
                          <button
                            onClick={() => {
                              setCursoAEliminar(curso);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all duration-300"
                            title="Eliminar"
                          >
                            <svg
                              stroke="currentColor"
                              fill="none"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              height="16"
                              width="16"
                              xmlns="http://www.w3.org/2000/svg"
                              className="hover:scale-110 transition-transform"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-gray-100">
          {isLoading ? (
            <div className="px-8 py-20 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400 uppercase text-[10px] font-black tracking-widest">
                Cargando...
              </span>
            </div>
          ) : cursosPagina.length === 0 ? (
            <div className="px-8 py-20 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest">
              No hay cursos
            </div>
          ) : (
            cursosPagina.map((curso) => (
              <div key={curso.id_curso} className="p-6 space-y-4 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{curso.nombre}</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                    ID: #{curso.id_curso}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 mb-1">
                      Duración
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {curso.duracion || '—'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 mb-1">
                      Estado
                    </span>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border w-fit ${
                        curso.estado === 'Activo'
                          ? 'text-emerald-600 border-emerald-100'
                          : 'text-amber-600 border-amber-100'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${curso.estado === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      />
                      {curso.estado}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-2">
                  <button
                    onClick={() => abrirModalEditar(curso)}
                    className="p-2 text-amber-500 bg-amber-50 rounded-lg"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => abrirModalEstado(curso)}
                    className="p-2 text-slate-400 bg-slate-50 rounded-lg"
                  >
                    <FaArchive size={14} />
                  </button>
                  <button
                    onClick={() => abrirModalInfo(curso)}
                    className="p-2 text-sky-500 bg-sky-50 rounded-lg"
                  >
                    <FaInfoCircle size={14} />
                  </button>
                  {esAdministrador && (
                    <button
                      onClick={() => {
                        setCursoAEliminar(curso);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-rose-500 bg-rose-50 rounded-lg"
                    >
                      <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" height="14" width="14">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Página <span className="text-sky-600">{pagina}</span> de {totalPaginas}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1 || isLoading}
              className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas || isLoading}
              className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#0E1C2B] text-white hover:bg-sky-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-md shadow-slate-900/10"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <InfoCursoModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        curso={cursoSeleccionado}
      />
      {esAdministrador && (
        <AddCursoModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={crearCurso}
        />
      )}
      {cursoAEditar && isEditModalOpen && (
        <EditCursoModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCursoAEditar(null);
          }}
          curso={cursoAEditar}
          onSave={guardarEdicion}
        />
      )}
      <ArchiveModal
        isOpen={isEstadoModalOpen}
        onClose={() => setIsEstadoModalOpen(false)}
        onConfirm={handleConfirmCambioEstado}
        itemName={cursoEstadoSeleccionado?.nombre || ''}
        nuevoEstado={cursoEstadoSeleccionado?.estado === 'Activo' ? 'Inactivo' : 'Activo'}
      />
      {esAdministrador && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCursoAEliminar(null);
          }}
          onConfirm={handleEliminar}
          itemName={cursoAEliminar?.nombre || ''}
        />
      )}
    </div>
  );
}