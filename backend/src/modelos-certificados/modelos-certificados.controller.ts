import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { multerImagenOptions } from '../common/multer-imagen.config';
import { ModelosCertificadosService } from './modelos-certificados.service';
import { CreateModelosCertificadoDto } from './dto/create-modelos-certificado.dto';
import { UpdateModelosCertificadoDto } from './dto/update-modelos-certificado.dto';

@Controller('admin/modelos-certificados')
export class ModelosCertificadosController {
  constructor(
    private readonly modelosCertificadosService: ModelosCertificadosService,
  ) {}

  // Sube la imagen y devuelve la ruta a guardar en la BD (con prefijo "storage/")
  @Post('upload')
  @UseInterceptors(FileInterceptor('imagen', multerImagenOptions))
  subirImagen(@UploadedFile() file?: any) {
    if (!file) {
      throw new BadRequestException('Debes subir una imagen.');
    }
    return { url: `storage/modelos/${file.filename}` };
  }

  // Borra el archivo físico de una imagen anterior (al reemplazarla o quitarla)
  @Delete('imagen')
  eliminarImagen(@Body('imagen') imagen: string) {
    if (!imagen) {
      throw new BadRequestException('Debes indicar la imagen a eliminar.');
    }
    const rutaRelativa = imagen.replace(/^storage\//, '');
    const rutaFisica = join(process.cwd(), 'uploads', rutaRelativa);
    if (fs.existsSync(rutaFisica)) {
      fs.unlinkSync(rutaFisica);
    }
    return { eliminado: true };
  }

  @Post()
  create(@Body() createModelosCertificadoDto: CreateModelosCertificadoDto) {
    return this.modelosCertificadosService.create(createModelosCertificadoDto);
  }

  @Get()
  findAll(@Query('search') search?: string, @Query('estado') estado?: string) {
    return this.modelosCertificadosService.findAll(search, estado);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modelosCertificadosService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateModelosCertificadoDto: UpdateModelosCertificadoDto,
  ) {
    return this.modelosCertificadosService.update(
      +id,
      updateModelosCertificadoDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modelosCertificadosService.remove(+id);
  }
}