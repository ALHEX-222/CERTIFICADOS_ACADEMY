import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from './entities/curso.entity';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepo: Repository<Curso>,
  ) {}

  create(createCursoDto: CreateCursoDto) {
    const curso = this.cursoRepo.create(createCursoDto);
    return this.cursoRepo.save(curso);
  }

  findAll() {
    return this.cursoRepo.find({ order: { id_curso: 'DESC' } });
  }

  async findOne(id: number) {
    const curso = await this.cursoRepo.findOne({ where: { id_curso: id } });
    if (!curso) {
      throw new NotFoundException(`Curso #${id} no encontrado`);
    }
    return curso;
  }

  findByNombre(nombre: string) {
    return this.cursoRepo.findOne({ where: { nombre } });
  }

  async update(id: number, updateCursoDto: UpdateCursoDto) {
    const curso = await this.findOne(id);
    Object.assign(curso, updateCursoDto);
    return this.cursoRepo.save(curso);
  }

  async remove(id: number) {
    const curso = await this.findOne(id);
    return this.cursoRepo.remove(curso);
  }
}