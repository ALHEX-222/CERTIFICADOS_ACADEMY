import { PartialType } from '@nestjs/mapped-types';
import { CreateModelosCertificadoDto } from './create-modelos-certificado.dto';

export class UpdateModelosCertificadoDto extends PartialType(CreateModelosCertificadoDto) {}
