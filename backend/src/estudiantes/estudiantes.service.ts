import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Injectable()
export class EstudiantesService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepo: Repository<Estudiante>,
  ) {}

  create(createEstudianteDto: CreateEstudianteDto) {
    const estudiante = this.estudianteRepo.create(createEstudianteDto);
    return this.estudianteRepo.save(estudiante);
  }

  findAll() {
    return this.estudianteRepo.find({ order: { id_estudiante: 'DESC' } });
  }

  async findOne(id: number) {
    const estudiante = await this.estudianteRepo.findOne({
      where: { id_estudiante: id },
    });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante #${id} no encontrado`);
    }
    return estudiante;
  }

  findByDocumento(numero_documento: string) {
    return this.estudianteRepo.findOne({ where: { numero_documento } });
  }

  async findOrCreateByDocumento(data: {
    nombre_completo: string;
    numero_documento: string;
    email?: string;
    telefono?: string;
  }) {
    let estudiante = await this.findByDocumento(data.numero_documento);
    if (!estudiante) {
      estudiante = await this.create(data);
    }
    return estudiante;
  }

  async update(id: number, updateEstudianteDto: UpdateEstudianteDto) {
    const estudiante = await this.findOne(id);
    Object.assign(estudiante, updateEstudianteDto);
    return this.estudianteRepo.save(estudiante);
  }

  async remove(id: number) {
    const estudiante = await this.findOne(id);
    return this.estudianteRepo.remove(estudiante);
  }
}