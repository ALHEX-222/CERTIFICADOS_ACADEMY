import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCursoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  duracion?: string;

  @IsString()
  @IsOptional()
  texto_certificado?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  estado?: string;
}