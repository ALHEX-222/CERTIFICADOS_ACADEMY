import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEmail,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateCertificadoDto {
  @IsInt()
  @IsNotEmpty()
  id_estudiante: number;

  @IsInt()
  @IsNotEmpty()
  id_curso: number;

  @IsString()
  @IsOptional()
  tipo_certificado?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @IsOptional()
  horas?: number;

  @IsDateString()
  @IsOptional()
  fecha_emision?: string;

  @IsDateString()
  @IsOptional()
  fecha_vencimiento?: string;

  @IsDateString()
  @IsOptional()
  fecha_inicio?: string;

  @IsDateString()
  @IsOptional()
  fecha_fin?: string;

  @IsNumber()
  @IsOptional()
  calificacion_final?: number;

  @IsEmail()
  @IsOptional()
  email_destinatario?: string;

  @IsString()
  @IsOptional()
  estado?: string;
}