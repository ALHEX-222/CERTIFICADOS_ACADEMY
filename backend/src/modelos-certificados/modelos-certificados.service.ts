import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ModelosCertificado } from './entities/modelos-certificado.entity';
import { CreateModelosCertificadoDto } from './dto/create-modelos-certificado.dto';
import { UpdateModelosCertificadoDto } from './dto/update-modelos-certificado.dto';

@Injectable()
export class ModelosCertificadosService {
  constructor(
    @InjectRepository(ModelosCertificado)
    private readonly modeloRepo: Repository<ModelosCertificado>,
  ) {}

  create(dto: CreateModelosCertificadoDto) {
    const modelo = this.modeloRepo.create(dto);
    return this.modeloRepo.save(modelo);
  }

  findAll(search?: string, estado?: string) {
    const where: any = {};
    if (estado) where.estado = estado;
    if (search) where.nombre = ILike(`%${search}%`);

    return this.modeloRepo.find({
      where,
      order: { id_modelo: 'DESC' },
    });
  }

  async findOne(id: number) {
    const modelo = await this.modeloRepo.findOne({ where: { id_modelo: id } });
    if (!modelo) {
      throw new NotFoundException(`Modelo #${id} no encontrado`);
    }
    return modelo;
  }

  async update(id: number, dto: UpdateModelosCertificadoDto) {
  const modelo = await this.findOne(id);

  if (dto.nombre !== undefined) modelo.nombre = dto.nombre;
  if (dto.descripcion !== undefined) modelo.descripcion = dto.descripcion;
  if (dto.imagen !== undefined) modelo.imagen = dto.imagen;
  if (dto.orientacion !== undefined) modelo.orientacion = dto.orientacion;
  if (dto.estado !== undefined) modelo.estado = dto.estado;

  // Importante: asignar el array nuevo para que TypeORM detecte el cambio en la columna JSON
  if (dto.campos_config !== undefined) {
    modelo.campos_config = dto.campos_config;
  }

  return this.modeloRepo.save(modelo);
}

  async remove(id: number) {
    const modelo = await this.findOne(id);
    return this.modeloRepo.remove(modelo);
  }
}