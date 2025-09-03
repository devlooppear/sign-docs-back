import { Test, TestingModule } from '@nestjs/testing';
import { AssinService } from './assin.service';

describe('AssinService', () => {
  let service: AssinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssinService],
    }).compile();

    service = module.get<AssinService>(AssinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
