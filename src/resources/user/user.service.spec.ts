import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: any;
  let assinService: any;

  beforeEach(() => {
    userRepository = {
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: 1 })),
      save: jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Test', email: 'test@test.com' }),
      findAndCount: jest
        .fn()
        .mockResolvedValue([
          [{ id: 1, name: 'Test', email: 'test@test.com' }],
          1,
        ]),
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Test', email: 'test@test.com' }),
    };
    assinService = { create: jest.fn().mockResolvedValue({}) };
    service = new UserService(userRepository, assinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should save a user', async () => {
    jest.spyOn(require('bcrypt'), 'hash').mockResolvedValue('hashed');
    jest
      .spyOn(require('../../common/utils/validation.util'), 'isCPF')
      .mockReturnValue(true);
    const dto = {
      name: 'Test',
      email: 'test@test.com',
      password: 'Abcdef1!',
      role: 'CLIENT',
      person_type: 'PF',
      document_number: '12345678901',
    };
    const result = await service.create(dto as any);
    expect(userRepository.create).toHaveBeenCalled();
    expect(userRepository.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('findAll should return users', async () => {
    const result = await service.findAll();
    expect(userRepository.findAndCount).toHaveBeenCalled();
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('findOne should return a user', async () => {
    const result = await service.findOne(1);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: expect.any(Array),
      select: expect.any(Array),
    });
    expect(result).toHaveProperty('id');
  });
});
