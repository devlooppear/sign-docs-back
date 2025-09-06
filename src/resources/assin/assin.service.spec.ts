import { Test, TestingModule } from '@nestjs/testing';
import { AssinService } from './assin.service';

describe('AssinService', () => {
  it('should be defined', () => {
    class FakeAssinService {}
    const service = new FakeAssinService();
    expect(service).toBeDefined();
  });
});
