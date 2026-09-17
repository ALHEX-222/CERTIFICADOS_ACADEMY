'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { AddEstudianteModal } from './agregarEstudiantes';
import { EditEstudianteModal } from './editEstudiantes';
import DeleteModal from '../components/DeleteModal';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../hooks/useToast';

function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function Estudiantes() {
  const { showToast } = useToast();
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [estudianteAEditar, setEstudianteAEditar] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [estudianteAEliminar, setEstudianteAEliminar] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'Activo' | 'Inactivo'>('todos');

  const fetchEstudiantes = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/estudiantes');
      setEstudiantes(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      showToast('No se pudieron cargar los estudiantes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const estudiantesFiltrados = estudiantes.filter((e) => {
    const coincideBusqueda =
      !busqueda.trim() ||
      e.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.numero_documento?.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.email?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = estadoFiltro === 'todos' || e.estado === estadoFiltro;
    return coincideBusqueda && coincideEstado;
  });

  const crearEstudiante = async (data: any) => {
    try {
      await apiClient.post('/estudiantes', data);
      showToast('✅ Estudiante creado correctamente', 'success');
      fetchEstudiantes();
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al crear el estudiante.';
      showToast(Array.isArray(msg) ? msg[0] : msg, 'error');
      return false;
    }
  };

  const guardarEdicion = async (data: any) => {
    if (!estudianteAEditar) return false;
    try {
      await apiClient.patch(`/estudiantes/${estudianteAEditar.id_estudiante}`, data);
      showToast('✅ Estudiante actualizado correctamente', 'success');
      fetchEstudiantes();
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al actualizar el estudiante.';
      showToast(Array.isArray(msg) ? msg[0] : msg, 'error');
      return false;
    }
  };

  const handleEliminar = async () => {
    if (!estudianteAEliminar) return;
    try {
      await apiClient.delete(`/estudiantes/${estudianteAEliminar.id_estudiante}`);
      setEstudiantes((prev) =>
        prev.filter((e) => e.id_estudiante !== estudianteAEliminar.id_estudiante),
      );
      showToast('✅ Estudiante eliminado', 'success');
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      showToast('Hubo un error al eliminar el estudiante.', 'error');
    } finally {
      setEstudianteAEliminar(null);
      setIsDeleteModalOpen(false);
    }
  };

  const hayFiltrosActivos = busqueda.trim() !== '' || estadoFiltro !== 'todos';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-600">
          Gestión de Estudiantes
        </h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 w-fit"
        >
          <FaPlus size={14} /> Nuevo Estudiante
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, documento o correo..."
            className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300 transition-all"
          />
        </div>

        <div className="flex gap-2">
          {(['todos', 'Activo', 'Inactivo'] as const).map((opcion) => (
            <button
              key={opcion}
              onClick={() => setEstadoFiltro(opcion)}
              className={`px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                estadoFiltro === opcion
                  ? 'bg-[#0E1C2B] text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {opcion === 'todos' ? 'Todos' : opcion === 'Activo' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                Estudiante
              </th>
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                Documento
              </th>
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                Contacto
              </th>
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                Registro
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
                <td colSpan={6} className="px-8 py-20 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest">
                  Cargando...
                </td>
              </tr>
            ) : estudiantesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest">
                  {hayFiltrosActivos ? 'Sin resultados para tu búsqueda' : 'No hay estudiantes registrados'}
                </td>
              </tr>
            ) : (
              estudiantesFiltrados.map((e) => (
                <tr key={e.id_estudiante} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden shadow-sm bg-slate-100 flex items-center justify-center text-[13px] font-black text-slate-400 uppercase">
                        {e.nombre_completo?.charAt(0) || '?'}
                      </div>
                      <span className="text-[14px] font-extrabold text-slate-900">
                        {e.nombre_completo}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[12px] font-bold text-slate-500">
                      {e.numero_documento}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-slate-700">
                        {e.email || '—'}
                      </span>
                      {e.telefono && (
                        <span className="text-[11px] font-medium text-slate-400">
                          {e.telefono}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                      {formatearFecha(e.created_at)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        e.estado === 'Activo'
                          ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                          : 'border-rose-100 bg-rose-50 text-rose-600'
                      }`}
                    >
                      {e.estado}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEstudianteAEditar(e);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 transition-all"
                        title="Editar"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEstudianteAEliminar(e);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
                        title="Eliminar"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddEstudianteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={crearEstudiante}
      />

      {estudianteAEditar && isEditModalOpen && (
        <EditEstudianteModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEstudianteAEditar(null);
          }}
          estudiante={estudianteAEditar}
          onSave={guardarEdicion}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleEliminar}
        itemName={estudianteAEliminar?.nombre_completo || ''}
      />
    </div>
  );
}