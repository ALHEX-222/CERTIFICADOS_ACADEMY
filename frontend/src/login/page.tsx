import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { API_URL } from '../config/api';
import { apiClient } from '../services/apiClient';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = API_URL;

type FetchJson = { ok: boolean; data: any };

async function postJson(url: string, body: any): Promise<FetchJson> {
  try {
    const relativeUrl = url.replace(API_BASE, '');
    const response = await apiClient.post(relativeUrl, body);
    return { ok: true, data: response.data };
  } catch (e: any) {
    const errorData = e?.response?.data || { error: e?.message || 'Error de red' };
    return { ok: false, data: errorData };
  }
}

function ForgotEmailModal({
  isOpen,
  defaultEmail,
  onClose,
}: {
  isOpen: boolean;
  defaultEmail?: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(defaultEmail || '');
  const [sending, setSending] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail || '');
      setSending(false);
      setDoneMsg(null);
      setErrMsg(null);
    }
  }, [isOpen, defaultEmail]);

  if (!isOpen) return null;

  const handleSend = async () => {
    setErrMsg(null);
    setDoneMsg(null);
    if (!email.trim()) {
      setErrMsg('Ingresa tu correo.');
      return;
    }
    setSending(true);
    const res = await postJson(`${API_BASE}/auth/forgot-password`, {
      email: email.trim(),
    });
    setSending(false);

    if (!res.ok) {
      const msg =
        res.data?.message || res.data?.error || 'No se pudo enviar el correo de recuperación.';
      setErrMsg(msg);
      return;
    }
    setDoneMsg(
      'Te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.',
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md rounded-[2.5rem] bg-[#050a12] border border-white/10 p-8 shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[50px] -mr-16 -mt-16" />

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
              <Mail size={24} className="text-sky-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Recuperar Acceso</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Contraseña olvidada
              </p>
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            No te preocupes, sucede. Ingresa tu correo y te enviaremos un enlace mágico para volver
            a entrar.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@dominio.com"
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                disabled={sending}
              />
            </div>

            {errMsg && (
              <div className="text-rose-400 text-xs font-bold bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                {errMsg}
              </div>
            )}
            {doneMsg && (
              <div className="text-emerald-400 text-xs font-bold bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                {doneMsg}
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-all"
                disabled={sending}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="flex-[2] px-6 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs shadow-lg shadow-sky-500/20 transition-all"
              >
                {sending ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromGithub = params.get('token');
    const isGithub = params.get('github');

    if (tokenFromGithub) {
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => {
      abortController.abort();
    }, 5000);

    apiClient
      .get(`/auth/profile?t=${Date.now()}`, {
        signal: abortController.signal,
      })
      .then(() => navigate('/admin', { replace: true }))
      .catch((err) => {
        console.debug('LoginPage auth check failed:', err);
        setCheckingAuth(false);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [navigate]);

  const preflightCsrf = async () => {
    const response = await apiClient.get(`/auth/csrf-token`);
    return response.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post(`/auth/login`, { email, password });
      const data = res.data;
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/admin', { replace: true });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Error de conexión con el servidor';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#03070c]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-sky-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-start relative overflow-y-auto py-8 md:py-12 px-6 md:px-12 lg:px-24 font-sans">
      <div className="fixed inset-0 z-0">
        <img
          src="/login.png"
          alt="Developer workspace"
          className="w-full h-full object-cover opacity-60 scale-105 pointer-events-none"
        />
        <div className="absolute inset-0 bg-[#03070c]/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 5;
          const duration = Math.random() * 5 + 5;
          const opacity = Math.random() * 0.6 + 0.4;
          const size = Math.random() * 5 + 3;
          const swing = Math.random() * 60 - 30;

          return (
            <motion.div
              key={`snow-${i}`}
              initial={{ y: -100, opacity: 0, x: 0 }}
              animate={{
                y: '100vh',
                opacity: [0, opacity, opacity, 0],
                x: [0, swing, swing * 2],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: 'linear',
              }}
              className="absolute bg-white rounded-full"
              style={{
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                filter: 'blur(1px)',
              }}
            />
          );
        })}
      </div>

      <div className="fixed inset-0 pointer-events-none z-0 mix-blend-screen">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-sky-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] bg-blue-700/10 blur-[150px] rounded-full animate-pulse animation-delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[540px] z-10"
      >
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] p-6 sm:p-8">
          <div className="text-center mb-5">
            <Link to="/" className="inline-block mb-5 hover:scale-105 transition-transform">
              <img
                src="/logomatt.png"
                alt="MIS Academy"
                className="h-20 w-auto drop-shadow-[0_0_18px_rgba(255,255,255,0.15)]"
              />
            </Link>
            <h1 className="text-3xl font-black font-['Outfit'] text-white uppercase tracking-tight mb-3">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-white/50 font-medium">
              Accede a tu cuenta y continúa aprendiendo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-['Outfit'] font-bold uppercase tracking-[0.15em] text-sky-100/70 ml-2">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-sky-500 group-focus-within:scale-110 transition-all duration-300">
                  <Mail size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@correo.com"
                  className="w-full pl-14 pr-4 py-3.5 rounded-[1.25rem] bg-slate-100 border border-transparent text-slate-900 font-medium text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all shadow-inner"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[11px] font-['Outfit'] font-bold uppercase tracking-[0.15em] text-sky-100/70">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-[11px] font-['Outfit'] font-bold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-sky-500 group-focus-within:scale-110 transition-all duration-300">
                  <Lock size={18} strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-3.5 rounded-[1.25rem] bg-slate-100 border border-transparent text-slate-900 font-medium text-sm tracking-widest placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all shadow-inner"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-[1.25rem] bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] focus:ring-4 focus:ring-sky-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group hover:-translate-y-1"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar a la Academia
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>

      <ForgotEmailModal
        isOpen={forgotOpen}
        defaultEmail={email}
        onClose={() => setForgotOpen(false)}
      />
    </div>
  );
}