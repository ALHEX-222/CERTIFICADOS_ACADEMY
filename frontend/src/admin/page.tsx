import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Users,
  FolderTree,
  LogOut,
  Menu,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { resolveAvatarUrl } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';

import ConfirmModal from './components/ConfirmModal';

import { Cursos } from './cursos/tabla';
import Certificados from './certificados/tabla';
import { Estudiantes } from '././estudiantes/tabla';
import ModelosCertificados from '././modelosCertificados/tabla';

type SeccionAdmin = 'cursos' | 'certificados' | 'estudiantes' | 'modelos-certificados';

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido?: string;
  email: string;
  id_rol: number;
  imagen_perfil?: string;
}

const MENU_ITEMS: { key: SeccionAdmin; label: string; icon: typeof BookOpen }[] = [
  { key: 'cursos', label: 'Cursos', icon: BookOpen },
  { key: 'certificados', label: 'Certificados', icon: Award },
  { key: 'estudiantes', label: 'Estudiantes', icon: Users },
  { key: 'modelos-certificados', label: 'Modelos de Certificados', icon: FolderTree },
];

export default function AdminLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<SeccionAdmin | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [userData, setUserData] = useState<Usuario | null>(() => {
    const stored = localStorage.getItem('user');

    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const [rol, setRol] = useState<number | null>(() => {
    const stored = localStorage.getItem('user');

    if (!stored) return null;

    try {
      const user = JSON.parse(stored);
      return Number(user.id_rol || user.user?.id_rol || null);
    } catch {
      return null;
    }
  });
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 640) {
        setIsSidebarHidden(true);
        setSidebarOpen(false);
      } else {
        setIsSidebarHidden(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab') as SeccionAdmin | null;

    if (tab && MENU_ITEMS.some((item) => item.key === tab)) {
      if (tab !== activeSection) {
        setActiveSection(tab);
      }
    } else if (!activeSection) {
      setActiveSection('cursos');
    }
  }, [searchParams, activeSection]);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [activeSection]);

  const handleMenuClick = (section: SeccionAdmin) => {
    setSearchParams({ tab: section });
    setActiveSection(section);
    setSidebarOpen(false);
  };

  useEffect(() => {
    const handleNavigate = (e: any) => {
      handleMenuClick(e.detail);
    };

    window.addEventListener('navigate-to-section', handleNavigate);

    return () => window.removeEventListener('navigate-to-section', handleNavigate);
  }, []);

  useEffect(() => {
    const userStored = localStorage.getItem('user');

    if (!userStored) {
      window.location.href = '/login';
      return;
    }

    try {
      const user = JSON.parse(userStored);

      setUserData(user);
      setRol(Number(user.id_rol || user.user?.id_rol || null));

      const currentTab = searchParams.get('tab');

      if (!currentTab) {
        setActiveSection('cursos');
      }

    } catch (error) {
      console.error('Error leyendo usuario almacenado:', error);
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('user');
    sessionStorage.clear();

    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      window.location.replace('/');
    }
  };

  if (activeSection === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#03070c] gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>

          <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-white font-black tracking-[0.2em] uppercase text-sm italic">
            MIS <span className="text-sky-500">Academy</span>
          </h2>

          <p className="text-sky-400/60 text-[9px] font-bold uppercase tracking-[0.3em]">
            Cargando Entorno Seguro
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'cursos':
        return <Cursos />;

      case 'certificados':
        return <Certificados />;

      case 'estudiantes':
        return <Estudiantes />;

      case 'modelos-certificados':
        return <ModelosCertificados />;

      default:
        return <Cursos />;
    }
  };

  const nombreUsuario =
    userData?.nombre ||
    'Usuario';

  const rolUsuario = Number(
  userData?.id_rol ||
  3
);

  const nombreCorto = nombreUsuario.split(' ')[0] || 'Usuario';

  const menuItemClass = (section: SeccionAdmin) => {
    const isActive = activeSection === section;
    const isCollapsed = window.innerWidth >= 640 && isSidebarHidden;

    return `
      text-left w-full flex items-center gap-2.5 rounded-xl transition-all duration-300 relative overflow-hidden group cursor-pointer
      ${
        isActive
          ? 'bg-sky-500/10 text-sky-400 font-black border-l-[3px] border-sky-400 rounded-l-none shadow-[inset_10px_0_15px_-10px_rgba(14,165,233,0.3)]'
          : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
      }
      ${isCollapsed ? 'justify-center h-11 w-11 mx-auto gap-0 px-0' : 'px-4 py-2.5'}
    `;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#03070c]" translate="no">
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        message="¿Estás seguro de cerrar sesión?"
      />

      {(() => {
        const showLabels = window.innerWidth < 640 ? sidebarOpen : !isSidebarHidden;

        const isCollapsed = window.innerWidth >= 640 && isSidebarHidden;

        return (
          <>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md sm:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}
            </AnimatePresence>

            <motion.aside
              initial={false}
              animate={{
                width:
                  window.innerWidth < 640 ? (sidebarOpen ? 288 : 0) : isSidebarHidden ? 80 : 288,

                x: window.innerWidth < 640 ? (sidebarOpen ? 0 : -288) : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 35,
              }}
              className={`fixed top-0 left-0 bottom-0 z-50 bg-[#050a10] text-white flex flex-col pt-5 pb-6
    sm:sticky sm:top-0 sm:h-screen
    border-r border-white/5 relative overflow-hidden
  `}
            >
              <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none" />

              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

              <div
                className={`px-5 mb-4 flex items-center relative z-10 ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
              >
                {showLabels && (
                  <Link to="/admin" className="flex items-center gap-3 group">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-sky-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                      <img
                        src="/images/logomatt.webp"
                        alt="MATT INNOVA SOLUTIONS"
                        className="w-[105px] h-auto object-contain relative z-10 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-black whitespace-nowrap">
                      Admin Panel
                    </span>
                  </Link>
                )}

                {isCollapsed && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-sky-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <img
                      src="/images/logomatt.webp"
                      alt="Logo"
                      className="w-[50px] h-auto object-contain relative z-10"
                    />
                  </div>
                )}

                <button
                  className="sm:hidden text-gray-500 hover:text-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Menu size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-1 overflow-y-auto sidebar-scrollbar pb-8 relative z-10">

                {showLabels && (
                  <div className="pt-2 text-[7px] uppercase tracking-[0.3em] text-white/20 font-black px-4 mb-2">
                    Gestión de certificados
                  </div>
                )}

                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.key}
                      onClick={() => handleMenuClick(item.key)}
                      className={menuItemClass(item.key)}
                    >
                      <Icon size={16} />

                      {showLabels && (
                        <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div
                className={`mt-auto pt-6 border-t border-white/5 relative z-10 bg-[#050a10]/80 backdrop-blur-xl ${
                  isCollapsed ? 'px-0 flex flex-col items-center pb-6' : 'px-5 pb-6'
                }`}
              >
                <div
                  className={`group transition-all duration-500 cursor-pointer ${
                    isCollapsed
                      ? 'mb-6'
                      : 'bg-white/5 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-white/5 hover:bg-sky-500/10 hover:border-sky-500/20'
                  }`}
                >
                  <div className="relative">
                    <div
                      className={`${
                        isCollapsed ? 'w-12 h-12 rounded-xl' : 'w-11 h-11 rounded-xl'
                      } overflow-hidden bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center text-white font-black shadow-2xl group-hover:border-sky-500 transition-all text-[12px]`}
                    >
                      {(() => {
                        const imgPath =
                          userData?.imagen_perfil;

                        const nombre = userData?.nombre || 'A';

                        const url = resolveAvatarUrl(imgPath);

                        if (url) {
                          return (
                            <img
                              src={url}
                              className="w-full h-full object-cover"
                              alt="Perfil"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) parent.innerText = nombre.charAt(0).toUpperCase();
                              }}
                            />
                          );
                        }

                        return nombre.charAt(0).toUpperCase();
                      })()}
                    </div>

                    <div
                      className={`absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-[#050a10] rounded-full shadow-[0_0_10px_rgba(16,185,129,1)] ${
                        isCollapsed ? 'w-3.5 h-3.5' : 'w-3 h-3'
                      }`}
                    />
                  </div>

                  {showLabels && (
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[13px] font-black truncate text-white tracking-tight leading-tight">
                        {nombreCorto}
                      </span>

                      <span className="text-[9px] text-sky-400 font-black uppercase tracking-[0.2em] mt-0.5">
                        {rolUsuario === 1 ? 'Administrador' : rolUsuario === 2 ? 'Coach' : 'Staff'}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className={`font-black text-[9px] uppercase tracking-[0.3em] rounded-xl text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5 flex items-center transition-all duration-300 group ${
                    isCollapsed ? 'justify-center w-12 h-12' : 'w-full px-5 py-3.5 gap-3'
                  }`}
                >
                  <LogOut
                    size={16}
                    className={isCollapsed ? '' : 'group-hover:translate-x-1 transition-transform'}
                  />

                  {showLabels && <span>Cerrar Sesión</span>}
                </button>
              </div>
            </motion.aside>
          </>
        );
      })()}

      <motion.div className="flex-1 flex flex-col h-screen overflow-hidden bg-white relative">
        <header className="bg-white/80 backdrop-blur-2xl px-4 md:px-8 py-4 md:py-5 border-b border-gray-100 flex items-center justify-between z-30 sticky top-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setIsSidebarHidden(!isSidebarHidden)}
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white text-sky-500 hover:text-sky-600 shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(14,165,233,0.15)] border border-slate-200 transition-all duration-300 active:scale-95 group"
              title={isSidebarHidden ? 'Mostrar Menú' : 'Ocultar Menú'}
            >
              {isSidebarHidden ? (
                <ChevronsRight
                  size={20}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              ) : (
                <ChevronsLeft
                  size={20}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
              )}
            </button>

            <button
              className="sm:hidden text-slate-900 p-2 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 leading-tight flex items-center gap-2">
                {MENU_ITEMS.find((item) => item.key === activeSection)?.label || 'Cursos'}
              </h1>

              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Matt Innova Solutions/</span>

                <span>{MENU_ITEMS.find((item) => item.key === activeSection)?.label || 'Cursos'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-black text-slate-900 tracking-tight">
                Hola, {nombreCorto} 👋
              </span>

              <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
          </div>
        </header>

        <main
          ref={mainContentRef}
          className="flex-1 overflow-y-auto bg-[#DDF4F8] sidebar-scrollbar"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-6"
          >
            {renderContent()}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}