import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Document } from './entities/document.entity';
import { User } from '../user/entities/user.entity';
import { createClient } from '@supabase/supabase-js';
import { DocumentStatus } from '../../common/enum/document-status.enum';
import { DOC_MAX_FILE_SIZE } from '../../common/utils/validation.util';
import { logError, logInfo } from '../../common/utils/log.util';
import { generateDocumentName } from '../../common/utils/documents.util';
import { UserRole } from '../../common/enum/user-role.enum';
import {
  PaginationDto,
  PaginationMetaDto,
} from '../../common/dto/pagination.dto';
import {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
} from '../../common/constants/pagination.const';

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
    file: Express.Multer.File;
    uploadedById: number;
    name?: string;
  }): Promise<Document> {
    try {
      if (!file) throw new InternalServerErrorException('File is required');
      if (file.mimetype !== 'application/pdf') {
        throw new InternalServerErrorException('Only PDF files are allowed');
      }
      if (file.size > this.maxFileSize) {
        throw new InternalServerErrorException(
          `File too large. Max size: ${this.maxFileSize} bytes`,
        );
      }

      const docName = name || generateDocumentName(file.originalname);
      const fileName = `${Date.now()}_${file.originalname}`;

      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(fileName, file.buffer, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (error) {
        throw new InternalServerErrorException(
          `Error uploading file: ${error.message}`,
        );
      }

      const uploaded_by = await this.userRepository.findOne({
        where: { id: uploadedById },
      });
      if (!uploaded_by) throw new NotFoundException('Uploader not found');

      const document = this.documentRepository.create({
        name: docName,
        file_path: data.path,
        uploaded_by,
        status: DocumentStatus.AVAILABLE,
      });

      const saved = await this.documentRepository.save(document);
      logInfo(`Document uploaded successfully: ${saved.id}`, 'DocumentService');
      return saved;
    } catch (error) {
      logError(error, 'DocumentService.uploadToStorage');
      throw error instanceof InternalServerErrorException
        ? error
        : new InternalServerErrorException('Error saving document');
    }
  }

  async findAll(
    user: { userId: number; role: string },
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    status?: string,
  ): Promise<PaginationDto<Document>> {
    try {
      const skip = (page - 1) * limit;
      let where: any =
        user.role === UserRole.ADMIN
          ? {}
          : { uploaded_by: { id: user.userId } };
      if (status) {
        where = { ...where, status };
      }

      const [data, totalItems] = await this.documentRepository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        relations: ['uploaded_by', 'signatures'],
        skip,
        take: limit,
      });

      data.forEach((doc) => {
        if (doc.uploaded_by) {
          (doc.uploaded_by as any).password = undefined;
        }
      });

      const totalPages = Math.ceil(totalItems / limit);
      const metadata: PaginationMetaDto = {
        page,
        size: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };

      logInfo(`Documents listed for user ${user.userId}`, 'DocumentService');
      return { data, metadata };
    } catch (error) {
      logError(error, 'DocumentService.findAll');
      throw new InternalServerErrorException('Error fetching documents');
    }
  }

  async findByUser(userId: number): Promise<Document[]> {
    try {
      const documents = await this.documentRepository.find({
        where: { uploaded_by: { id: userId } },
        order: { created_at: 'DESC' },
        relations: ['uploaded_by', 'signatures'],
      });

      documents.forEach((doc) => {
        if (doc.uploaded_by) {
          (doc.uploaded_by as any).password = undefined;
        }
      });

      logInfo(
        `Documents fetched for user ${userId}, count: ${documents.length}`,
        'DocumentService.findByUser',
      );

      return documents;
    } catch (error) {
      logError(error, 'DocumentService.findByUser');
      throw new InternalServerErrorException('Error fetching user documents');
    }
  }

  async remove(id: number, user: { userId: number; role: string }) {
    try {
      const document = await this.documentRepository.findOne({
        where: { id },
        relations: ['uploaded_by'],
      });
      if (!document) throw new NotFoundException('Document not found');

      if (
        user.role !== UserRole.ADMIN &&
        document.uploaded_by.id !== user.userId
      ) {
        throw new ForbiddenException('Not allowed to delete this document');
      }

      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([document.file_path]);
      if (error) {
        throw new InternalServerErrorException(
          'Error deleting file from storage',
        );
      }

      await this.documentRepository.delete(id);
      logInfo(`Document deleted: ${id}`, 'DocumentService.remove');
      return { message: 'Document deleted successfully' };
    } catch (error) {
      logError(error, 'DocumentService.remove');
      throw error instanceof NotFoundException ||
        error instanceof ForbiddenException
        ? error
        : new InternalServerErrorException('Error deleting document');
    }
  }
}
