'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  IoClose,
  IoSaveOutline,
  IoTrashOutline,
  IoAddCircleOutline,
  IoAlertCircle,
} from 'react-icons/io5';
import { apiClient } from '../../services/apiClient';
import { resolveAvatarUrl } from '../../config/api';

const CAMPOS_DISPONIBLES: { key: string; label: string; isQr?: boolean }[] = [
  { key: 'nombre_estudiante', label: 'Nombre completo del estudiante' },
  { key: 'codigo_certificado', label: 'Código de validez' },
  { key: 'qr', label: 'Código QR', isQr: true },
];

const TIPOGRAFIAS = [
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Helvetica-Bold', label: 'Helvetica Bold' },
  { value: 'Helvetica-Oblique', label: 'Helvetica Oblique' },
  { value: 'Helvetica-BoldOblique', label: 'Helvetica Bold Oblique' },
  { value: 'Times-Roman', label: 'Times Roman' },
  { value: 'Times-Bold', label: 'Times Bold' },
  { value: 'Times-Italic', label: 'Times Italic' },
  { value: 'Times-BoldItalic', label: 'Times Bold Italic' },
  { value: 'Courier', label: 'Courier' },
  { value: 'Courier-Bold', label: 'Courier Bold' },
  { value: 'Courier-Oblique', label: 'Courier Oblique' },
  { value: 'Courier-BoldOblique', label: 'Courier Bold Oblique' },
];

interface CampoPosicionado {
  campo: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  align: 'left' | 'center' | 'right';
  color: string;
  bold: boolean;
}

interface ModeloDetalle {
  id_modelo: number;
  nombre: string;
  descripcion?: string | null;
  imagen?: string | null;
  campos_config?: CampoPosicionado[] | string | null;
}

const COLOR_DEFECTO = '#0E1C2B';
const FONT_DEFECTO = 'Helvetica';

function normalizarCampo(raw: any): CampoPosicionado {
  const esQr = raw?.campo === 'qr';
  return {
    campo: String(raw?.campo ?? ''),
    x: Number(raw?.x) || 0,
    y: Number(raw?.y) || 0,
    width: Number(raw?.width) || (esQr ? 180 : 600),
    height: Number(raw?.height) || (esQr ? 180 : 40),
    fontSize: Number(raw?.fontSize) || (esQr ? 0 : 22),
    fontFamily: String(raw?.fontFamily || FONT_DEFECTO),
    align: (['left', 'center', 'right'].includes(raw?.align) ? raw.align : 'center') as
      | 'left'
      | 'center'
      | 'right',
    color: String(raw?.color || COLOR_DEFECTO),
    bold: Boolean(raw?.bold),
  };
}

function parseCamposConfig(raw: ModeloDetalle['campos_config']): CampoPosicionado[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c) => c && typeof c.campo === 'string').map(normalizarCampo);
  } catch {
    return [];
  }
}

type ResizeHandle = 'se' | 'sw' | 'ne' | 'nw' | 'e' | 'w' | 's' | 'n';

export function DisenadorCamposModal({
  isOpen,
  onClose,
  idModelo,
  onGuardado,
}: {
  isOpen: boolean;
  onClose: () => void;
  idModelo: number | null;
  onGuardado?: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    index: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const resizeRef = useRef<{
    index: number;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  const [modelo, setModelo] = useState<ModeloDetalle | null>(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const [campos, setCampos] = useState<CampoPosicionado[]>([]);
  const [campoAColocar, setCampoAColocar] = useState<string | null>(null);
  const [campoSeleccionado, setCampoSeleccionado] = useState<number | null>(null);
  const [escala, setEscala] = useState(1);

  useEffect(() => {
    if (!isOpen || idModelo == null) return;
    setError('');
    setCargando(true);
    setCampoAColocar(null);
    setCampoSeleccionado(null);
    apiClient
      .get(`/admin/modelos-certificados/${idModelo}`)
      .then((res) => {
        const data = res.data;
        setModelo(data);
        setCampos(parseCamposConfig(data?.campos_config));
      })
      .catch((err) => {
        console.error('Error cargando modelo:', err);
        setError('No se pudo cargar el modelo.');
      })
      .finally(() => setCargando(false));
  }, [isOpen, idModelo]);

  const recalcularEscala = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;
    setEscala(img.clientWidth / img.naturalWidth);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', recalcularEscala);
    return () => window.removeEventListener('resize', recalcularEscala);
  }, [recalcularEscala]);

  const handleClickImagen = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!campoAColocar || !imgRef.current || dragRef.current || resizeRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    const clickYDisplay = e.clientY - rect.top;
    const clickXDisplay = e.clientX - rect.left;
    const yReal = clickYDisplay / escala;
    const xReal = clickXDisplay / escala;
    const anchoRealImagen = imgRef.current.naturalWidth;

    const esQr = campoAColocar === 'qr';

    const nuevoCampo = normalizarCampo({
      campo: campoAColocar,
      x: esQr ? Math.round(xReal - 90) : 40,
      y: Math.round(yReal),
      width: esQr ? 180 : Math.max(200, anchoRealImagen - 80),
      height: esQr ? 180 : 40,
      fontSize: esQr ? 0 : 22,
      fontFamily: FONT_DEFECTO,
      align: 'center',
      color: COLOR_DEFECTO,
      bold: false,
    });

    setCampos((prev) => {
      const filtrado = prev.filter((c) => c.campo !== campoAColocar);
      const nuevos = [...filtrado, nuevoCampo];
      setCampoSeleccionado(nuevos.length - 1);
      return nuevos;
    });
    setCampoAColocar(null);
  };

  const handleMouseDownCampo = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    setCampoSeleccionado(index);
    const c = campos[index];
    if (!c) return;

    dragRef.current = {
      index,
      startX: e.clientX,
      startY: e.clientY,
      origX: c.x,
      origY: c.y,
    };
  };

  const handleMouseDownResize = (
    e: React.MouseEvent,
    index: number,
    handle: ResizeHandle,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setCampoSeleccionado(index);
    const c = campos[index];
    if (!c) return;

    resizeRef.current = {
      index,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: c.x,
      origY: c.y,
      origW: c.width,
      origH: c.height,
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!imgRef.current) return;

      if (dragRef.current) {
        const { index, startX, startY, origX, origY } = dragRef.current;
        const dx = (e.clientX - startX) / escala;
        const dy = (e.clientY - startY) / escala;
        setCampos((prev) =>
          prev.map((c, i) =>
            i === index
              ? { ...c, x: Math.round(origX + dx), y: Math.round(origY + dy) }
              : c,
          ),
        );
        return;
      }

      if (resizeRef.current) {
        const { index, handle, startX, startY, origX, origY, origW, origH } =
          resizeRef.current;
        const dx = (e.clientX - startX) / escala;
        const dy = (e.clientY - startY) / escala;

        setCampos((prev) =>
          prev.map((c, i) => {
            if (i !== index) return c;

            let x = origX;
            let y = origY;
            let w = origW;
            let h = origH;
            const esQr = c.campo === 'qr';
            const minSize = esQr ? 40 : 20;

            if (handle.includes('e')) w = Math.max(minSize, origW + dx);
            if (handle.includes('w')) {
              w = Math.max(minSize, origW - dx);
              x = origX + (origW - w);
            }
            if (handle.includes('s')) h = Math.max(minSize, origH + dy);
            if (handle.includes('n')) {
              h = Math.max(minSize, origH - dy);
              y = origY + (origH - h);
            }

            if (
              esQr &&
              (handle === 'se' || handle === 'sw' || handle === 'ne' || handle === 'nw')
            ) {
              const side = Math.max(minSize, Math.max(w, h));
              if (handle.includes('w')) x = origX + origW - side;
              if (handle.includes('n')) y = origY + origH - side;
              w = side;
              h = side;
            }

            return {
              ...c,
              x: Math.round(x),
              y: Math.round(y),
              width: Math.round(w),
              height: Math.round(h),
            };
          }),
        );
      }
    };

    const onUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [escala]);

  const actualizarCampo = (index: number, cambios: Partial<CampoPosicionado>) => {
    setCampos((prev) =>
      prev.map((c, i) => (i === index ? normalizarCampo({ ...c, ...cambios }) : c)),
    );
  };

  const eliminarCampo = (index: number) => {
    setCampos((prev) => prev.filter((_, i) => i !== index));
    setCampoSeleccionado(null);
  };

  const campoYaColocado = (key: string) => campos.some((c) => c.campo === key);

  const textoPreview = (c: CampoPosicionado) => {
    return CAMPOS_DISPONIBLES.find((d) => d.key === c.campo)?.label || c.campo;
  };

  const handleGuardar = async () => {
    if (!modelo) return;
    setGuardando(true);
    setError('');
    try {
      const camposLimpios = campos.map((c) => ({
        campo: c.campo,
        x: Math.round(Number(c.x) || 0),
        y: Math.round(Number(c.y) || 0),
        width: Math.round(Number(c.width) || 100),
        height: Math.round(Number(c.height) || 40),
        fontSize: Math.round(Number(c.fontSize) || 22),
        fontFamily: c.fontFamily || FONT_DEFECTO,
        align: c.align || 'center',
        color: c.color || COLOR_DEFECTO,
        bold: Boolean(c.bold),
      }));

      await apiClient.put(`/admin/modelos-certificados/${modelo.id_modelo}`, {
        campos_config: camposLimpios,
      });
      onGuardado?.();
      onClose();
    } catch (err: any) {
      console.error('Error guardando campos_config:', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'No se pudo guardar la configuración. Intenta nuevamente.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  const imagenSrc = modelo?.imagen ? resolveAvatarUrl(modelo.imagen) : null;
  const campoActivo =
    campoSeleccionado != null && campos[campoSeleccionado]
      ? campos[campoSeleccionado]
      : null;
  const esCampoQr = campoActivo?.campo === 'qr';

  const handles: { id: ResizeHandle; style: React.CSSProperties; cursor: string }[] = [
    { id: 'nw', style: { top: -5, left: -5 }, cursor: 'nwse-resize' },
    { id: 'ne', style: { top: -5, right: -5 }, cursor: 'nesw-resize' },
    { id: 'sw', style: { bottom: -5, left: -5 }, cursor: 'nesw-resize' },
    { id: 'se', style: { bottom: -5, right: -5 }, cursor: 'nwse-resize' },
    {
      id: 'n',
      style: { top: -5, left: '50%', transform: 'translateX(-50%)' },
      cursor: 'ns-resize',
    },
    {
      id: 's',
      style: { bottom: -5, left: '50%', transform: 'translateX(-50%)' },
      cursor: 'ns-resize',
    },
    {
      id: 'w',
      style: { left: -5, top: '50%', transform: 'translateY(-50%)' },
      cursor: 'ew-resize',
    },
    {
      id: 'e',
      style: { right: -5, top: '50%', transform: 'translateY(-50%)' },
      cursor: 'ew-resize',
    },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              Posicionar campos {modelo ? `· ${modelo.nombre}` : ''}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Haz clic en un campo y luego en la plantilla · Arrastra para mover · Esquinas para
              redimensionar
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <IoClose size={22} />
          </button>
        </div>

        {cargando ? (
          <div className="flex-1 flex items-center justify-center p-20">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-56 border-r border-slate-100 overflow-y-auto px-4 py-5 flex-shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                Campos disponibles
              </p>
              <div className="flex flex-col gap-2">
                {CAMPOS_DISPONIBLES.map((c) => {
                  const colocado = campoYaColocado(c.key);
                  const activo = campoAColocar === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCampoAColocar(activo ? null : c.key)}
                      className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                        activo
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : colocado
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-100 hover:border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{c.label}</span>
                      {!colocado && <IoAddCircleOutline size={16} />}
                    </button>
                  );
                })}
              </div>
              {campoAColocar && (
                <div className="mt-4 bg-sky-50 border border-sky-200 rounded-xl px-3 py-3 text-[11px] font-semibold text-sky-700">
                  Ahora haz clic sobre la plantilla para colocar este campo.
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto bg-slate-50 flex items-start justify-center p-6">
              {imagenSrc ? (
                <div
                  className={`relative inline-block select-none ${
                    campoAColocar ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  onClick={handleClickImagen}
                >
                  <img
                    ref={imgRef}
                    src={imagenSrc}
                    alt={modelo?.nombre}
                    className="max-w-full block rounded-lg shadow-md"
                    onLoad={recalcularEscala}
                    draggable={false}
                  />
                  {campos.map((c, i) => {
                    const esQr = c.campo === 'qr';
                    const seleccionado = campoSeleccionado === i;
                    return (
                      <div
                        key={c.campo}
                        onMouseDown={(e) => handleMouseDownCampo(e, i)}
                        style={{
                          position: 'absolute',
                          left: c.x * escala,
                          top: c.y * escala,
                          width: Math.max(20, c.width * escala),
                          height: Math.max(20, c.height * escala),
                          textAlign: c.align,
                          fontSize: esQr ? 11 : Math.max(8, (c.fontSize || 22) * escala),
                          fontFamily: c.fontFamily || FONT_DEFECTO,
                          color: c.color || COLOR_DEFECTO,
                          fontWeight: c.bold ? 700 : 500,
                          pointerEvents: 'auto',
                          cursor: 'move',
                          outline: seleccionado ? '2px solid #0284c7' : '1px dashed #94a3b8',
                          outlineOffset: 0,
                          backgroundColor: seleccionado
                            ? 'rgba(14, 165, 233, 0.12)'
                            : esQr
                            ? 'rgba(255,255,255,0.75)'
                            : 'rgba(255,255,255,0.4)',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          userSelect: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent:
                            c.align === 'left'
                              ? 'flex-start'
                              : c.align === 'right'
                              ? 'flex-end'
                              : 'center',
                          padding: esQr ? 0 : '2px 6px',
                          borderRadius: 2,
                          boxSizing: 'border-box',
                          overflow: 'hidden',
                          textTransform: esQr ? 'none' : 'uppercase',
                        }}
                      >
                        {esQr ? (
                          <div className="flex flex-col items-center justify-center w-full h-full text-[10px] font-bold text-slate-500 leading-tight">
                            <span>QR</span>
                            <span className="opacity-60">
                              {Math.round(c.width)}×{Math.round(c.height)}
                            </span>
                          </div>
                        ) : (
                          <span className="truncate w-full">{textoPreview(c)}</span>
                        )}

                        {seleccionado &&
                          handles.map((h) => (
                            <div
                              key={h.id}
                              onMouseDown={(e) => handleMouseDownResize(e, i, h.id)}
                              style={{
                                position: 'absolute',
                                width: 10,
                                height: 10,
                                background: '#0284c7',
                                border: '1.5px solid white',
                                borderRadius: 2,
                                zIndex: 10,
                                cursor: h.cursor,
                                ...h.style,
                              }}
                            />
                          ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-20 text-slate-400 text-sm font-medium italic">
                  Este modelo no tiene imagen configurada.
                </div>
              )}
            </div>

            <div className="w-72 border-l border-slate-100 overflow-y-auto px-5 py-5 flex-shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                Propiedades
              </p>
              {!campoActivo || campoSeleccionado == null ? (
                <p className="text-xs text-slate-400 font-medium italic">
                  Selecciona o arrastra un campo en la plantilla para editarlo.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Campo</p>
                    <p className="text-sm font-bold text-slate-800">
                      {CAMPOS_DISPONIBLES.find((d) => d.key === campoActivo.campo)?.label}
                    </p>
                  </div>

                  {!esCampoQr && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                        Tamaño de letra
                      </label>
                      <input
                        type="number"
                        min={6}
                        max={120}
                        value={campoActivo.fontSize}
                        onChange={(e) =>
                          actualizarCampo(campoSeleccionado, {
                            fontSize: Number(e.target.value) || 22,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800"
                      />
                    </div>
                  )}

                  {!esCampoQr && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                        Tipografía
                      </label>
                      <select
                        value={campoActivo.fontFamily}
                        onChange={(e) =>
                          actualizarCampo(campoSeleccionado, {
                            fontFamily: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800"
                      >
                        {TIPOGRAFIAS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {esCampoQr && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                          Ancho
                        </label>
                        <input
                          type="number"
                          min={40}
                          max={500}
                          value={campoActivo.width}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 180;
                            actualizarCampo(campoSeleccionado, {
                              width: val,
                              height: val,
                            });
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                          Alto
                        </label>
                        <input
                          type="number"
                          min={40}
                          max={500}
                          value={campoActivo.height}
                          onChange={(e) =>
                            actualizarCampo(campoSeleccionado, {
                              height: Number(e.target.value) || 180,
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {!esCampoQr && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                        Alineación
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['left', 'center', 'right'] as const).map((al) => (
                          <button
                            key={al}
                            type="button"
                            onClick={() =>
                              actualizarCampo(campoSeleccionado, { align: al })
                            }
                            className={`py-2 rounded-lg text-[10px] font-black uppercase border ${
                              campoActivo.align === al
                                ? 'border-sky-500 bg-sky-50 text-sky-700'
                                : 'border-slate-200 text-slate-500'
                            }`}
                          >
                            {al === 'left' ? 'Izq.' : al === 'center' ? 'Centro' : 'Der.'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!esCampoQr && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                        Color
                      </label>
                      <input
                        type="color"
                        value={campoActivo.color}
                        onChange={(e) =>
                          actualizarCampo(campoSeleccionado, { color: e.target.value })
                        }
                        className="w-full h-9 rounded-lg border border-slate-200 cursor-pointer"
                      />
                    </div>
                  )}

                  {!esCampoQr && (
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={campoActivo.bold}
                        onChange={(e) =>
                          actualizarCampo(campoSeleccionado, {
                            bold: e.target.checked,
                          })
                        }
                      />
                      Negrita
                    </label>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                        X (px)
                      </label>
                      <input
                        type="number"
                        value={campoActivo.x}
                        onChange={(e) =>
                          actualizarCampo(campoSeleccionado, {
                            x: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                        Y (px)
                      </label>
                      <input
                        type="number"
                        value={campoActivo.y}
                        onChange={(e) =>
                          actualizarCampo(campoSeleccionado, {
                            y: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  {!esCampoQr && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                        Ancho caja (px)
                      </label>
                      <input
                        type="number"
                        value={campoActivo.width}
                        onChange={(e) =>
                          actualizarCampo(campoSeleccionado, {
                            width: Number(e.target.value) || 100,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => eliminarCampo(campoSeleccionado)}
                    className="flex items-center justify-center gap-2 text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg py-2 text-xs font-bold"
                  >
                    <IoTrashOutline size={14} /> Quitar campo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mx-8 mb-4 flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4">
            <IoAlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-rose-700">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando || !modelo}
            className="flex items-center gap-2 bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] hover:shadow-xl disabled:opacity-50"
          >
            <IoSaveOutline size={16} />
            {guardando ? 'Guardando...' : 'Guardar posiciones'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisenadorCamposModal;