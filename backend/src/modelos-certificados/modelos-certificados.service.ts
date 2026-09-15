import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  findAll() {
    return this.modeloRepo.find({ order: { id_modelo: 'DESC' } });
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
    Object.assign(modelo, dto);
    return this.modeloRepo.save(modelo);
  }

  async remove(id: number) {
    const modelo = await this.findOne(id);
    return this.modeloRepo.remove(modelo);
  }
}