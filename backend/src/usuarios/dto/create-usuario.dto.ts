import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsOptional()
  @IsInt()
  id_rol?: number; // opcional, se autoasigna 1 (admin) en el service

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  dni?: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  imagen_perfil?: string;

  @IsOptional()
  @IsString()
  biografia?: string;

  @IsOptional()
  @IsString()
  estado?: string;
}