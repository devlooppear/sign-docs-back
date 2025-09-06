import { Test, TestingModule } from '@nestjs/testing';
import { AssinController } from './assin.controller';
import { AssinService } from './assin.service';

describe('AssinController', () => {
  let controller: AssinController;
  let assinService: AssinService;

  beforeEach(async () => {
    const mockAssinService = {
      findAll: jest.fn().mockResolvedValue({ data: [{ id: 1 }], metadata: {} }),
      findByUser: jest.fn().mockResolvedValue([{ id: 1 }]),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssinController],
      providers: [{ provide: AssinService, useValue: mockAssinService }],
    }).compile();

    controller = module.get<AssinController>(AssinController);
    assinService = module.get<AssinService>(AssinService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('find should call findAll for ADMIN', async () => {
    jest
      .spyOn(require('../../common/utils/user.util'), 'getUserFromRequest')
      .mockReturnValue({ userId: 1, role: 'ADMIN' });
    const req = { user: { userId: 1, role: 'ADMIN' }, query: {} };
    const result = await controller.find(req as any);
    expect(assinService.findAll).toHaveBeenCalled();
    if (Array.isArray(result)) {
      expect(Array.isArray(result)).toBe(true);
    } else {
      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
    }
  });

  it('find should call findByUser for CLIENT', async () => {
    jest
      .spyOn(require('../../common/utils/user.util'), 'getUserFromRequest')
      .mockReturnValue({ userId: 1, role: 'CLIENT' });
    const req = { user: { userId: 1, role: 'CLIENT' }, query: {} };
    const result = await controller.find(req as any);
    expect(assinService.findByUser).toHaveBeenCalledWith(1);
    expect(Array.isArray(result)).toBe(true);
  });

  it('find should return error for unauthorized', async () => {
    jest
      .spyOn(require('../../common/utils/user.util'), 'getUserFromRequest')
      .mockReturnValue({ userId: 1, role: 'OTHER' });
    const req = { user: { userId: 1, role: 'OTHER' }, query: {} };
    const result = await controller.find(req as any);
    expect(result).toHaveProperty('error');
  });
});
