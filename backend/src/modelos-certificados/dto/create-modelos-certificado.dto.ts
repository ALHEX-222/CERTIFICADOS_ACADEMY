import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MaxLength,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CampoConfigDto {
  @IsString()
  campo: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  width: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsNumber()
  fontSize: number;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsString()
  @IsIn(['left', 'center', 'right'])
  align: string;

  @IsString()
  color: string;

  @IsOptional()
  @IsBoolean()
  bold?: boolean;
}

export class CreateModelosCertificadoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsString()
  @IsOptional()
  orientacion?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampoConfigDto)
  campos_config?: CampoConfigDto[];

  @IsString()
  @IsOptional()
  estado?: string;
}