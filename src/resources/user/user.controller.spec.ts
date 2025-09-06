import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = {
      create: jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Test', email: 'test@test.com' }),
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Test', email: 'test@test.com' }),
      findAll: jest
        .fn()
        .mockResolvedValue({
          data: [{ id: 1, name: 'Test', email: 'test@test.com' }],
          metadata: {},
        }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register should call userService.create', async () => {
    const dto = {
      name: 'Test',
      email: 'test@test.com',
      password: 'Abcdef1!',
      role: 'CLIENT',
      person_type: 'PF',
      document_number: '12345678901',
    };
    const result = await controller.register(dto as any);
    expect(userService.create).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('id');
  });

  it('getMe should call userService.findOne', async () => {
    const req = { user: { userId: 1 } };

    jest
      .spyOn(require('../../common/utils/user.util'), 'getUserFromRequest')
      .mockReturnValue({ userId: 1 });
    const result = await controller.getMe(req as any);
    expect(userService.findOne).toHaveBeenCalledWith(1);
    expect(result).toHaveProperty('id');
  });

  it('listUsers should return all users for ADMIN', async () => {
    jest
      .spyOn(require('../../common/utils/user.util'), 'getUserFromRequest')
      .mockReturnValue({ userId: 1, role: 'ADMIN' });
    const req = { user: { userId: 1, role: 'ADMIN' } };
    const result = await controller.listUsers(req as any);
    expect(userService.findAll).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
  });

  it('listUsers should return one user for CLIENT', async () => {
    jest
      .spyOn(require('../../common/utils/user.util'), 'getUserFromRequest')
      .mockReturnValue({ userId: 1, role: 'CLIENT' });
    const req = { user: { userId: 1, role: 'CLIENT' } };
    const result = await controller.listUsers(req as any);
    expect(userService.findOne).toHaveBeenCalledWith(1);
    expect(Array.isArray(result)).toBe(true);
  });

  it('listUsers should return error for unauthorized', async () => {
    jest
      .spyOn(require('../../common/utils/user.util'), 'getUserFromRequest')
      .mockReturnValue({ userId: 1, role: 'OTHER' });
    const req = { user: { userId: 1, role: 'OTHER' } };
    const result = await controller.listUsers(req as any);
    expect(result).toHaveProperty('error');
  });
});
