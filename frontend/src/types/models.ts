// 1. PersonalAccessToken
export interface PersonalAccessToken {
  id: number;
  tokenable_type: string;
  tokenable_id: number;
  name: string;
  token: string;
  abilities: string | null;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// 2. Rol
export interface Rol {
  id_rol: number;
  nombre_rol: string;
  descripcion: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
}

// 3. Usuario
export interface Usuario {
  id_usuario?: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  password?: string;
  id_rol: number;
  estado: string;
  imagen_perfil?: string | null;
  biografia?: string | null;
  email_verificado?: boolean;
  fecha_registro?: string;
  ultimo_acceso?: string;
}

// 5. Curso
export interface Curso {
  id_curso: number;
  nombre: string;
  descripcion: string;
  texto_certificado?: string | null;
  descripcion_corta?: string | null;
  descripcion_larga?: string | null;
  imagen: string | null;
  video_previsualizacion?: string | null;
  lo_que_aprenderas?: string | null;
  requisitos?: string | null;
  duracion: number | string;
  duracion_horas?: number;
  tiempo?: number | null;
  precio: number;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado' | string;
  estado: 'Publicado' | 'Activo' | 'Inactivo' | 'Archivado' | string;
  destacado: boolean | 0 | 1;
  docente?: {
    id_usuario: number;
    nombre: string;
    apellido?: string;
    imagen_perfil?: string | null;
  } | null;
  id_docente?: number | null;
  fecha_creacion: string;
  fecha_actualizacion?: string | null;
  id_ruta?: number;
  rutas: (number | { id_ruta: number; nombre?: string; orden?: number })[];
}
// 21. Estudiante
export interface Estudiante {
  id_estudiante: number;
  nombre_completo: string;
  numero_documento: string;
  email?: string | null;
  telefono?: string | null;
  estado?: string;
  created_at?: string;
  updated_at?: string;
}
export interface Certificado {
  id_certificado: number;
  id_estudiante: number;
  estudiante?: Estudiante;
  id_curso: number;
  curso?: Curso;
  nombre_estudiante: string;
  dni_estudiante?: string | null;
  nombre_curso: string;
  codigo_certificado: string;
  tipo_certificado: string;
  descripcion?: string | null;
  horas?: number | null;
  fecha_emision?: string | null;
  fecha_vencimiento?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  calificacion_final?: number | null;
  email_destinatario?: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
}

// 21. Certificacion
interface CertificacionBase {
  id_certificacion: number;
  codigo_certificado: string;
  tipo_certificado: 'empresa' | 'Certificado de Aprobación' | 'adicional';
  fecha_emision: string | null;
}

export interface CertificacionEmpresa
  extends CertificacionBase {
  tipo_certificado:
    | 'empresa'
    | 'Certificado de Aprobación';

  id_usuario: number;
  id_curso: number;
  calificacion_final: number | null;
  url_certificado: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  usuario_dni?: string;
  nombre_estudiante?: string;
  nombre_curso?: string;
  total_horas?: number;
  email_destinatario?: string;
}

export interface CertificacionAdicional
  extends CertificacionBase {
  tipo_certificado: 'adicional';
  id_usuario?: number;
  id_curso?: never;
  calificacion_final?: number | null;
  url_certificado?: never;
  nombre_estudiante: string;
  nombre_curso: string;
  fecha_inicio: string;
  fecha_fin: string;
  total_horas: number;
  email_destinatario: string;
  dni_estudiante?: string;
}

export type Certificacion = CertificacionEmpresa | CertificacionAdicional;

// 24. Notificacion
export interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  titulo: string;
  mensaje: string;
  tipo: 'Sistema' | 'Curso' | 'Pago' | 'Certificacion' | string;
  leida: boolean;
  fecha_creacion: string;
  fecha_leida: string | null;
}

// 25. TokenUsuario
export interface TokenUsuario {
  id_token: number;
  id_usuario: number;
  token: string;
  tipo: 'Verificacion' | 'Reseteo' | 'API' | string;
  fecha_creacion: string;
  fecha_expiracion: string;
  usado: boolean;
}

// 26. SesionUsuario
export interface SesionUsuario {
  id_sesion: string;
  id_usuario: number;
  ip_address: string | null;
  user_agent: string | null;
  payload: string | null;
  ultimo_acceso: string;
}

// 30. Contacto
export interface Contacto {
  id_contacto: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  asunto: string;
  mensaje: string;
  fecha_envio: string;
  estado: 'Pendiente' | 'Respondido' | 'Archivado' | string;
  fecha_respuesta: string | null;
  respuesta: string | null;
}

// 31. Session (para autenticación Laravel o similar)
export interface Session {
  id: string;
  user_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  payload: string;
  last_activity: number;
}
