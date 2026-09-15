import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerImagenOptions } from '../common/multer-imagen.config';
import { ModelosCertificadosService } from './modelos-certificados.service';
import { CreateModelosCertificadoDto } from './dto/create-modelos-certificado.dto';
import { UpdateModelosCertificadoDto } from './dto/update-modelos-certificado.dto';

@Controller('modelos-certificados')
export class ModelosCertificadosController {
  constructor(
    private readonly modelosCertificadosService: ModelosCertificadosService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen', multerImagenOptions))
  create(
    @Body() createModelosCertificadoDto: CreateModelosCertificadoDto,
    @UploadedFile() file?: any,
  ) {
    if (!file) {
      throw new BadRequestException('La imagen del modelo es obligatoria.');
    }
    createModelosCertificadoDto.url_imagen = `modelos-certificados/${file.filename}`;
    return this.modelosCertificadosService.create(createModelosCertificadoDto);
  }

  @Get()
  findAll() {
    return this.modelosCertificadosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modelosCertificadosService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('imagen', multerImagenOptions))
  update(
    @Param('id') id: string,
    @Body() updateModelosCertificadoDto: UpdateModelosCertificadoDto,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      updateModelosCertificadoDto.url_imagen = `modelos-certificados/${file.filename}`;
    }
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