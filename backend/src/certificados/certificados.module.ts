import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificadosService } from './certificados.service';
import { CertificadosController } from './certificados.controller';
import { Certificado } from './entities/certificado.entity';
import { EstudiantesModule } from '../estudiantes/estudiantes.module';
import { CursosModule } from '../cursos/cursos.module';
import { ModelosCertificadosModule } from '../modelos-certificados/modelos-certificados.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificado]),
    EstudiantesModule,
    CursosModule,
    ModelosCertificadosModule,
  ],
  controllers: [CertificadosController],
  providers: [CertificadosService],
  exports: [TypeOrmModule],
})
export class CertificadosModule {}