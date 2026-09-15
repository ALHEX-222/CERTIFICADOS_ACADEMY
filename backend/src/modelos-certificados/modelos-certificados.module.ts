import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelosCertificadosService } from './modelos-certificados.service';
import { ModelosCertificadosController } from './modelos-certificados.controller';
import { ModelosCertificado } from './entities/modelos-certificado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModelosCertificado])],
  controllers: [ModelosCertificadosController],
  providers: [ModelosCertificadosService],
  exports: [TypeOrmModule, ModelosCertificadosService],
})
export class ModelosCertificadosModule {}