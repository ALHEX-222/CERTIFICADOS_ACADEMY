import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const usuario = await this.usuariosService.create(registerDto);
    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.findByEmail(loginDto.email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    if (usuario.estado !== 'Activo') {
      throw new UnauthorizedException('Tu cuenta no está activa.');
    }

    const passwordValida = await bcrypt.compare(
      loginDto.password,
      usuario.password,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    await this.usuariosService.actualizarUltimoAcceso(usuario.id_usuario);

    const payload = {
      sub: usuario.id_usuario,
      email: usuario.email,
      id_rol: usuario.id_rol,
    };

    const { password, ...usuarioSinPassword } = usuario;

    return {
      access_token: this.jwtService.sign(payload),
      user: usuarioSinPassword,
    };
  }

  async profile(userId: number) {
    const usuario = await this.usuariosService.findOne(userId);
    const { password, ...usuarioSinPassword } = usuario;
    return { user: usuarioSinPassword };
  }
}