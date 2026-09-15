import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CertificadosService } from './certificados.service';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';

@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Post()
  create(@Body() createCertificadoDto: CreateCertificadoDto) {
    return this.certificadosService.create(createCertificadoDto);
  }

  @Post('carga-masiva')
  @UseInterceptors(FileInterceptor('archivo'))
  async cargaMasiva(@UploadedFile() file?: any) {
    if (!file) {
      throw new BadRequestException('Debes subir un archivo Excel.');
    }
    return this.certificadosService.cargaMasiva(file.buffer);
  }

  // Descarga individual: GET /certificados/5/descargar?id_modelo=1
  @Get(':id/descargar')
  async descargar(
    @Param('id') id: string,
    @Query('id_modelo') idModelo: string,
    @Res() res: Response,
  ) {
    if (!idModelo) {
      throw new BadRequestException('Debes indicar id_modelo.');
    }
    const buffer = await this.certificadosService.generarPdfIndividual(
      +id,
      +idModelo,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${id}.pdf"`,
    });
    res.send(buffer);
  }

  // Descarga múltiple: POST /certificados/descarga-multiple
  // body: { ids: number[], id_modelo: number, modo: 'individual' | 'unico' }
  @Post('descarga-multiple')
  async descargaMultiple(
    @Body() dto: { ids: number[]; id_modelo: number; modo: 'individual' | 'unico' },
    @Res() res: Response,
  ) {
    if (!dto.ids?.length || !dto.id_modelo) {
      throw new BadRequestException('Debes indicar ids[] e id_modelo.');
    }

    if (dto.modo === 'unico') {
      const buffer = await this.certificadosService.generarPdfCombinado(
        dto.ids,
        dto.id_modelo,
      );
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificados.pdf"`,
      });
      return res.send(buffer);
    }

    const buffer = await this.certificadosService.generarZipIndividuales(
      dto.ids,
      dto.id_modelo,
    );
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="certificados.zip"`,
    });
    res.send(buffer);
  }

  @Get()
findAll(
  @Query('page') page?: string,
  @Query('perPage') perPage?: string,
  @Query('busqueda') busqueda?: string,
  @Query('tipo_certificado') tipo_certificado?: string,
  @Query('cursoId') cursoId?: string,
) {
  return this.certificadosService.findAll();
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.certificadosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCertificadoDto: UpdateCertificadoDto,
  ) {
    return this.certificadosService.update(+id, updateCertificadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.certificadosService.remove(+id);
  }
}