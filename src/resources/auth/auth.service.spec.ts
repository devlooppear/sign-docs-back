import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('should be defined', () => {
    class FakeAuthService {}
    const service = new FakeAuthService();
    expect(service).toBeDefined();
  });
});
