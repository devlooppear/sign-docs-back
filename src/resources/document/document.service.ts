import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document } from './entities/document.entity';
import { User } from '../user/entities/user.entity';
import { createClient } from '@supabase/supabase-js';
import { DocumentStatus } from '../../common/enum/document-status.enum';
import { DOC_MAX_FILE_SIZE } from '../../common/utils/validation.util';
import { logError, logInfo } from '../../common/utils/log.util';
import { generateDocumentName } from '../../common/utils/documents.util';

@Injectable()
export class DocumentService {
  private supabase;
  private bucket: string;
  private maxFileSize: number;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL') || '';
    const supabaseKey = configService.get<string>('SUPABASE_KEY') || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucket = configService.get<string>('SUPABASE_BUCKET') || 'docs-sign';
    this.maxFileSize = Number(DOC_MAX_FILE_SIZE);
  }

  async uploadToStorage({
    file,
    uploadedById,
    name,
  }: {
    file: import('multer').File;
    uploadedById: number;
    name?: string;
  }): Promise<Document> {
    try {
      if (!file) throw new InternalServerErrorException('File is required');
      if (file.mimetype !== 'application/pdf')
        throw new InternalServerErrorException('Only PDF files are allowed');
      if (file.size > this.maxFileSize)
        throw new InternalServerErrorException(
          `File too large. Max size: ${this.maxFileSize} bytes`,
        );

      let docName = name;
      if (!docName) {
        docName = generateDocumentName(file.originalname);
      }
      const fileName = `${Date.now()}_${file.originalname}`;
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(fileName, file.buffer, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (error)
        throw new InternalServerErrorException(
          `Error uploading file: ${error.message}`,
        );

      const uploaded_by = await this.userRepository.findOne({
        where: { id: uploadedById },
      });
      if (!uploaded_by)
        throw new InternalServerErrorException('Uploader not found');

      const document = this.documentRepository.create({
        name: docName,
        file_path: data.path,
        uploaded_by,
        status: DocumentStatus.AVAILABLE,
      });

      const saved = await this.documentRepository.save(document);
      logInfo(
        `Document uploaded successfully: ${saved.id}`,
        'DocumentService.uploadToStorage',
      );
      return saved;
    } catch (error) {
      logError(error, 'DocumentService.uploadToStorage');
      throw error instanceof InternalServerErrorException
        ? error
        : new InternalServerErrorException('Error saving document');
    }
  }

  findAll() {
    return `This action returns all document`;
  }

  findOne(id: number) {
    return `This action returns a #${id} document`;
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`;
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
  }
}
