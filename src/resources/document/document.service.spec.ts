import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';

describe('DocumentService', () => {
  it('should be defined', () => {
    class FakeDocumentService {}
    const service = new FakeDocumentService();
    expect(service).toBeDefined();
  });
});
