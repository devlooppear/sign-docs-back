import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

describe('DocumentController', () => {
  let controller: DocumentController;
  let documentService: DocumentService;

  beforeEach(async () => {
    const mockDocumentService = {
      uploadToStorage: jest.fn().mockResolvedValue({ id: 1, name: 'doc.pdf' }),
      findAll: jest
        .fn()
        .mockResolvedValue({
          data: [{ id: 1, name: 'doc.pdf' }],
          metadata: {},
        }),
      findByUser: jest.fn().mockResolvedValue([{ id: 1, name: 'doc.pdf' }]),
      remove: jest.fn().mockResolvedValue({ message: 'ok' }),
      assignDocument: jest.fn().mockResolvedValue({ message: 'assigned' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [{ provide: DocumentService, useValue: mockDocumentService }],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    documentService = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('uploadDocument should call service', async () => {
    const file = {
      originalname: 'doc.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from(''),
      size: 100,
    };
    const req = { user: { userId: 1 } };
    const result = await controller.uploadDocument(file as any, req as any);
    expect(documentService.uploadToStorage).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('find should call findAll for ADMIN', async () => {
    const req = { user: { userId: 1, role: 'ADMIN' }, query: {} };
    const result = await controller.find(req as any);
    expect(documentService.findAll).toHaveBeenCalled();

    if (Array.isArray(result)) {
      expect(Array.isArray(result)).toBe(true);
    } else {
      expect(Array.isArray(result.data)).toBe(true);
    }
  });

  it('find should call findByUser for CLIENT', async () => {
    const req = { user: { userId: 1, role: 'CLIENT' }, query: {} };
    const result = await controller.find(req as any);
    expect(documentService.findByUser).toHaveBeenCalledWith(1);
    expect(Array.isArray(result)).toBe(true);
  });

  it('remove should call service', async () => {
    const req = { user: { userId: 1, role: 'ADMIN' } };
    const result = await controller.remove('1', req as any);
    expect(documentService.remove).toHaveBeenCalledWith(1, req.user);
    expect(result).toHaveProperty('message');
  });

  it('assignDocument should call service', async () => {
    const body = { documentId: 1, page: 1, x: 10, y: 10 };
    const req = { user: { userId: 1 } };
    const result = await controller.assignDocument(body as any, req as any);
    expect(documentService.assignDocument).toHaveBeenCalled();
    expect(result).toHaveProperty('message');
  });
});
