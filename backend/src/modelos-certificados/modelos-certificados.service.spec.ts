import { Test, TestingModule } from '@nestjs/testing';
import { ModelosCertificadosService } from './modelos-certificados.service';

describe('ModelosCertificadosService', () => {
  let service: ModelosCertificadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModelosCertificadosService],
    }).compile();

    service = module.get<ModelosCertificadosService>(ModelosCertificadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
