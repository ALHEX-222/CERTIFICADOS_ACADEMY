export class CargaMasivaResultadoDto {
  total_filas: number;
  certificados_creados: number;
  estudiantes_creados: number;
  cursos_creados: number;
  errores: { fila: number; mensaje: string }[];
}