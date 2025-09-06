import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn().mockResolvedValue({ token: 'token', user: { id: 1, name: 'Test', role: 'CLIENT' } }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login should call service', async () => {
    const body = { email: 'test@test.com', password: '123456' };
    const result = await controller.login(body);
    expect(authService.login).toHaveBeenCalledWith(body.email, body.password);
    expect(result).toHaveProperty('token');
  });
});
