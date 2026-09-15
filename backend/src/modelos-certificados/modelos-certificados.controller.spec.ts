import { Test, TestingModule } from '@nestjs/testing';
import { ModelosCertificadosController } from './modelos-certificados.controller';
import { ModelosCertificadosService } from './modelos-certificados.service';

describe('ModelosCertificadosController', () => {
  let controller: ModelosCertificadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModelosCertificadosController],
      providers: [ModelosCertificadosService],
    }).compile();

    controller = module.get<ModelosCertificadosController>(ModelosCertificadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
