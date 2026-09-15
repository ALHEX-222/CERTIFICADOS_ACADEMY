import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
  const existente = await this.usuarioRepository.findOne({
    where: { email: createUsuarioDto.email },
  });
  if (existente) {
    throw new ConflictException('Ya existe un usuario con ese correo.');
  }

  const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

  const usuario = this.usuarioRepository.create({
    ...createUsuarioDto,
    id_rol: createUsuarioDto.id_rol ?? 1,
    password: hashedPassword,
  });

  return this.usuarioRepository.save(usuario);
}

  findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario: id },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario #${id} no encontrado.`);
    }
    return usuario;
  }

  findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async actualizarUltimoAcceso(id: number): Promise<void> {
    await this.usuarioRepository.update(id, { ultimo_acceso: new Date() });
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuarioRepository.softRemove(usuario);
  }
}