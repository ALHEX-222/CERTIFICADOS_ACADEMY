export const API_URL = import.meta.env.VITE_API_URL;

export const BASE_URL = API_URL?.replace(/\/api\/?$/, '') || '';

/**
 * Helper para construir URLs de la API
 * @example apiUrl('/auth/profile') // => 'https://misacademy.siteedufuture.xyz/api/auth/profile'
 */
export const apiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_URL}/${cleanPath}`;
};

/**
 * Helper para construir URLs de archivos estáticos (avatares, imágenes, etc.)
 * servidos directamente por el backend, fuera del prefijo /api.
 * Soporta URLs absolutas (http/https) y blob:/data: sin modificarlas.
 * @example resolveAvatarUrl('uploads/avatar.jpg') // => 'https://misacademy.siteedufuture.xyz/uploads/avatar.jpg'
 */
export const resolveAvatarUrl = (imgPath?: string | null): string => {
  if (!imgPath) return '';
  if (/^https?:\/\//i.test(imgPath) || /^(blob:|data:)/i.test(imgPath)) return imgPath;
  const cleanPath = imgPath.replace(/^\/?(api\/)?/, '');
  return `${BASE_URL}/${cleanPath}`; // ✅ usa BASE_URL, sin /api
};