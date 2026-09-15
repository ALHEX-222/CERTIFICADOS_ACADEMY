import { IsString, IsNotEmpty, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreateModelosCertificadoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @IsOptional()
  url_imagen?: string;

  @IsString()
  @IsOptional()
  orientacion?: string;

  @IsArray()
  @IsOptional()
  campos_config?: Record<string, any>[];

  @IsString()
  @IsOptional()
  estado?: string;
}