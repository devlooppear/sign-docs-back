import { Test, TestingModule } from '@nestjs/testing';
import { AssinController } from './assin.controller';
import { AssinService } from './assin.service';

describe('AssinController', () => {
  let controller: AssinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssinController],
      providers: [AssinService],
    }).compile();

    controller = module.get<AssinController>(AssinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
