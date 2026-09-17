import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { readFileSync } from 'fs';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { imageSize } from 'image-size';
import * as archiver from 'archiver';
import { Certificado } from './entities/certificado.entity';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';
import { CargaMasivaResultadoDto } from './dto/carga-masiva-resultado.dto';
import { EstudiantesService } from '../estudiantes/estudiantes.service';
import { CursosService } from '../cursos/cursos.service';
import { ModelosCertificadosService } from '../modelos-certificados/modelos-certificados.service';

@Injectable()
export class CertificadosService {
  constructor(
    @InjectRepository(Certificado)
    private readonly certificadoRepo: Repository<Certificado>,
    private readonly estudiantesService: EstudiantesService,
    private readonly cursosService: CursosService,
    private readonly modelosCertificadosService: ModelosCertificadosService,
  ) {}

  async create(dto: CreateCertificadoDto) {
    const estudiante = await this.estudiantesService.findOne(dto.id_estudiante);
    const curso = await this.cursosService.findOne(dto.id_curso);

    const certificado = this.certificadoRepo.create({
      ...dto,
      nombre_estudiante: estudiante.nombre_completo,
      dni_estudiante: estudiante.numero_documento,
      nombre_curso: curso.nombre,
      codigo_certificado: this.generarCodigo(),
      fecha_emision: dto.fecha_emision ? new Date(dto.fecha_emision) : new Date(),
    });

    return this.certificadoRepo.save(certificado);
  }

  findAll() {
    return this.certificadoRepo.find({ order: { id_certificado: 'DESC' } });
  }

  async findOne(id: number) {
    const certificado = await this.certificadoRepo.findOne({
      where: { id_certificado: id },
    });
    if (!certificado) {
      throw new NotFoundException(`Certificado #${id} no encontrado`);
    }
    return certificado;
  }

  async update(id: number, dto: UpdateCertificadoDto) {
    const certificado = await this.findOne(id);
    Object.assign(certificado, dto);
    return this.certificadoRepo.save(certificado);
  }

  async remove(id: number) {
    const certificado = await this.findOne(id);
    return this.certificadoRepo.remove(certificado);
  }

  async cargaMasiva(buffer: Buffer): Promise<CargaMasivaResultadoDto> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];

    const resultado: CargaMasivaResultadoDto = {
      total_filas: 0,
      certificados_creados: 0,
      estudiantes_creados: 0,
      cursos_creados: 0,
      errores: [],
    };

    const headerRow = sheet.getRow(1);
    const headers: Record<string, number> = {};
    headerRow.eachCell((cell, colNumber) => {
      const key = String(cell.value).trim().toLowerCase().replace(/\s+/g, '_');
      headers[key] = colNumber;
    });

    const getCell = (row: any, key: string): string | undefined => {
      const col = headers[key];
      if (!col) return undefined;
      const value = row.getCell(col).value;
      return value != null ? String(value).trim() : undefined;
    };

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      if (row.cellCount === 0 || !row.getCell(1).value) continue;

      resultado.total_filas++;

      try {
        let nombreCompleto = getCell(row, 'nombre_completo');
        if (!nombreCompleto) {
          const nombres = getCell(row, 'nombres');
          const apellidos = getCell(row, 'apellidos');
          if (nombres && apellidos) {
            nombreCompleto = `${nombres} ${apellidos}`;
          }
        }

        const numeroDocumento =
          getCell(row, 'numero_documento') ||
          getCell(row, 'dni') ||
          getCell(row, 'documento');
        const nombreCurso = getCell(row, 'curso') || getCell(row, 'nombre_curso');
        const email = getCell(row, 'email');
        const horas = getCell(row, 'horas');
        const fechaInicio = getCell(row, 'fecha_inicio');
        const fechaFin = getCell(row, 'fecha_fin');
        const calificacion =
          getCell(row, 'calificacion_final') || getCell(row, 'calificacion');

        if (!nombreCompleto || !numeroDocumento || !nombreCurso) {
          resultado.errores.push({
            fila: i,
            mensaje: 'Faltan datos obligatorios (nombre, documento o curso).',
          });
          continue;
        }

        let estudiante = await this.estudiantesService.findByDocumento(
          numeroDocumento,
        );
        if (!estudiante) {
          estudiante = await this.estudiantesService.create({
            nombre_completo: nombreCompleto,
            numero_documento: numeroDocumento,
            email,
          });
          resultado.estudiantes_creados++;
        }

        let curso = await this.cursosService.findByNombre(nombreCurso);
        if (!curso) {
          curso = await this.cursosService.create({ nombre: nombreCurso });
          resultado.cursos_creados++;
        }

        await this.create({
          id_estudiante: estudiante.id_estudiante,
          id_curso: curso.id_curso,
          horas: horas ? Number(horas) : undefined,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          calificacion_final: calificacion ? Number(calificacion) : undefined,
          email_destinatario: email,
        });

        resultado.certificados_creados++;
      } catch (err: any) {
        resultado.errores.push({
          fila: i,
          mensaje: err.message || 'Error desconocido al procesar la fila.',
        });
      }
    }

    return resultado;
  }

  // ============================================================
  // GENERACIÓN DE PDF
  // ============================================================

  private getDatosParaPlantilla(certificado: Certificado): Record<string, string> {
    return {
      nombre_estudiante: certificado.nombre_estudiante || '',
      nombre_curso: certificado.nombre_curso || '',
      codigo_certificado: certificado.codigo_certificado || '',
      dni_estudiante: certificado.dni_estudiante || '',
      horas: certificado.horas != null ? String(certificado.horas) : '',
      calificacion_final:
        certificado.calificacion_final != null
          ? String(certificado.calificacion_final)
          : '',
      fecha_emision: certificado.fecha_emision
        ? new Date(certificado.fecha_emision).toLocaleDateString('es-PE')
        : '',
      fecha_inicio: certificado.fecha_inicio
        ? new Date(certificado.fecha_inicio).toLocaleDateString('es-PE')
        : '',
      fecha_fin: certificado.fecha_fin
        ? new Date(certificado.fecha_fin).toLocaleDateString('es-PE')
        : '',
    };
  }

  private dibujarCertificado(
    doc: PDFKit.PDFDocument,
    certificado: Certificado,
    imagePath: string,
    dimensions: { width: number; height: number },
    campos_config: Record<string, any>[],
  ) {
    doc.image(imagePath, 0, 0, {
      width: dimensions.width,
      height: dimensions.height,
    });

    const datos = this.getDatosParaPlantilla(certificado);

    for (const campo of campos_config || []) {
      const texto = datos[campo.campo] ?? '';
      doc
        .fontSize(campo.fontSize || 24)
        .fillColor(campo.color || '#000000')
        .text(texto, campo.x, campo.y, {
          width: campo.width || dimensions.width - campo.x,
          align: campo.align || 'left',
        });
    }
  }

  private async obtenerImagenYDimensiones(idModelo: number) {
  const modelo = await this.modelosCertificadosService.findOne(idModelo);
  const rutaRelativa = modelo.imagen.replace(/^storage\//, '');
  const imagePath = join(process.cwd(), 'uploads', rutaRelativa);
  const buffer = readFileSync(imagePath);
  const dimensions = imageSize(buffer);
  return {
    modelo,
    imagePath,
    dimensions: {
      width: dimensions.width || 842,
      height: dimensions.height || 595,
    },
  };
}

  async generarPdfIndividual(idCertificado: number, idModelo: number): Promise<Buffer> {
    const certificado = await this.findOne(idCertificado);
    const { modelo, imagePath, dimensions } = await this.obtenerImagenYDimensiones(idModelo);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: [dimensions.width, dimensions.height],
        margin: 0,
      });
      const buffers: Buffer[] = [];
      doc.on('data', (b: Buffer) => buffers.push(b));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      this.dibujarCertificado(doc, certificado, imagePath, dimensions, modelo.campos_config);
      doc.end();
    });
  }

  async generarPdfCombinado(ids: number[], idModelo: number): Promise<Buffer> {
    const { modelo, imagePath, dimensions } = await this.obtenerImagenYDimensiones(idModelo);

    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({
        size: [dimensions.width, dimensions.height],
        margin: 0,
        autoFirstPage: false,
      });
      const buffers: Buffer[] = [];
      doc.on('data', (b: Buffer) => buffers.push(b));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      try {
        for (const id of ids) {
          const certificado = await this.findOne(id);
          doc.addPage({ size: [dimensions.width, dimensions.height], margin: 0 });
          this.dibujarCertificado(doc, certificado, imagePath, dimensions, modelo.campos_config);
        }
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  async generarZipIndividuales(ids: number[], idModelo: number): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const archive = (archiver as any)('zip', { zlib: { level: 9 } });
    const buffers: Buffer[] = [];
    archive.on('data', (b: Buffer) => buffers.push(b));
    archive.on('end', () => resolve(Buffer.concat(buffers)));
    archive.on('error', reject);

    try {
      for (const id of ids) {
        const pdfBuffer = await this.generarPdfIndividual(id, idModelo);
        const certificado = await this.findOne(id);
        const nombreArchivo = `${certificado.codigo_certificado}-${certificado.nombre_estudiante}.pdf`
          .replace(/[^a-zA-Z0-9-_. ]/g, '');
        archive.append(pdfBuffer, { name: nombreArchivo });
      }
      archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
}

  private generarCodigo(): string {
    return `CERT-${uuidv4().split('-')[0].toUpperCase()}`;
  }
}