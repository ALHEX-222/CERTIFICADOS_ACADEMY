import { IsString, IsNotEmpty, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateEstudianteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre_completo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  numero_documento: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @IsString()
  @IsOptional()
  estado?: string;
}