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
import { SUPABASE_BUCKET } from '../../common/constants/document.const';

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Assin } from '../assin/entities/assin.entity';
import { getDocumentPublicUrl } from '../../common/utils/documents.util';
import { TipoPessoa } from '../../common/enum/tipo-pessoa.enum';
import {
  formatCpfCnpj,
  generateSignatureHash,
} from '../../common/utils/signature.util';
import {
  SIGNATURE_BOX_WIDTH,
  SIGNATURE_BOX_HEIGHT,
  SIGNATURE_FONT_SIZE,
  SIGNATURE_FONT_SIZE_NAME,
  SIGNATURE_FONT_SIZE_LABEL,
  SIGNATURE_FONT_SIZE_HASH,
} from '../../common/constants/signature.const';

@Injectable()
export class DocumentService {
  private supabase;
  private bucket: string;
  private maxFileSize: number;

  async assignDocument({ documentId, page, x, y, user }) {
    const pageNum = Number(page);
    const xNum = Number(x);
    const yNum = Number(y);
    if (isNaN(pageNum) || isNaN(xNum) || isNaN(yNum)) {
      throw new InternalServerErrorException(
        'Parâmetros page, x e y devem ser números válidos',
      );
    }

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['uploaded_by'],
    });
    if (!document) throw new NotFoundException('Documento não encontrado');

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .download(document.file_path);
    if (error || !data)
      throw new InternalServerErrorException('Erro ao baixar PDF original');
    const pdfBuffer = await data.arrayBuffer();

    const assinUser = await this.userRepository.findOne({
      where: { id: user.userId },
    });
    if (!assinUser) throw new NotFoundException('Usuário não encontrado');
    const code = Date.now();
    const signature_hash = generateSignatureHash({
      id: assinUser.id,
      name: assinUser.name,
      document_number: assinUser.document_number,
      code,
    });
    const assinatura = this.assinRepository.create({
      user: assinUser,
      code,
      signature_hash,
    });
    await this.assinRepository.save(assinatura);

    const docLabel = assinUser.person_type === TipoPessoa.PF ? 'CPF' : 'CNPJ';
    const docValue = formatCpfCnpj(
      assinUser.document_number.replace(/\D/g, ''),
      assinUser.person_type,
    );

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    const targetPage = pages[pageNum - 1] || pages[0];
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const boxWidth = SIGNATURE_BOX_WIDTH;
    const boxHeight = SIGNATURE_BOX_HEIGHT;

    targetPage.drawRectangle({
      x: xNum + 1,
      y: yNum - 1,
      width: boxWidth,
      height: boxHeight,
      color: rgb(0.93, 0.93, 0.93),
      opacity: 0.5,
    });
    targetPage.drawRectangle({
      x: xNum,
      y: yNum,
      width: boxWidth,
      height: boxHeight,
      color: rgb(1, 1, 1),
      opacity: 0.98,
    });

    const textLines = [
      `Assinado digitalmente`,
      `${assinUser.name}`,
      `${docLabel}: ${docValue}`,
      `Data: ${new Date().toLocaleString('pt-BR')}`,
      `Hash: ${assinatura.signature_hash}`,
    ];
    let yText = yNum + boxHeight - 10;
    for (let i = 0; i < textLines.length; i++) {
      targetPage.drawText(textLines[i], {
        x: xNum + 7,
        y: yText,
        size:
          i === 1
            ? SIGNATURE_FONT_SIZE_NAME
            : i === 0
              ? SIGNATURE_FONT_SIZE_LABEL
              : i === 4
                ? SIGNATURE_FONT_SIZE_HASH
                : SIGNATURE_FONT_SIZE,
        font,
        color: rgb(0, 0, 0),
        opacity: 1,
        maxWidth: boxWidth - 14,
      });
      yText -= i === 1 ? 10 : i === 0 ? 8 : 9;
    }

    const signedPdfBytes = await pdfDoc.save();
    const signedFileName = document.file_path.replace(/\.pdf$/, '_signed.pdf');

    const { error: uploadError } = await this.supabase.storage
      .from(this.bucket)
      .upload(signedFileName, Buffer.from(signedPdfBytes), {
        contentType: 'application/pdf',
        upsert: true,
      });
    if (uploadError)
      throw new InternalServerErrorException('Erro ao subir PDF assinado');

    document.file_path = signedFileName;
    document.status = DocumentStatus.SIGNED;
    await this.documentRepository.save(document);

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const url = getDocumentPublicUrl(supabaseUrl, this.bucket, signedFileName);
    return {
      message: 'Documento assinado com sucesso',
      assinatura: {
        id: assinatura.id,
        nome: assinUser.name,
        tipo: assinUser.person_type,
        documento: docValue,
        hash: assinatura.signature_hash,
        data: assinatura.signed_at,
      },
      file_path: signedFileName,
      url,
    };
  }

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Assin)
    private readonly assinRepository: Repository<Assin>,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL') || '';
    const supabaseKey = configService.get<string>('SUPABASE_KEY') || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucket =
      configService.get<string>('SUPABASE_BUCKET') || SUPABASE_BUCKET;
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
  }): Promise<{ document: Document; url: string }> {
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

      const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
      const url = getDocumentPublicUrl(supabaseUrl, this.bucket, data.path);

      return { document: saved, url };
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
        relations: ['uploaded_by'],
        skip,
        take: limit,
      });

      const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
      data.forEach((doc) => {
        if (doc.uploaded_by) {
          (doc.uploaded_by as any).password = undefined;
        }

        (doc as any).url = getDocumentPublicUrl(
          supabaseUrl,
          SUPABASE_BUCKET,
          doc.file_path,
        );
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

  async findByUser(
    userId: number,
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    status?: string,
  ): Promise<PaginationDto<Document>> {
    try {
      const skip = (page - 1) * limit;
      let where: any = { uploaded_by: { id: userId } };
      if (status) {
        where = { ...where, status };
      }

      const [data, totalItems] = await this.documentRepository.findAndCount({
        where,
        order: { created_at: 'DESC' },
        relations: ['uploaded_by'],
        skip,
        take: limit,
      });

      const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
      data.forEach((doc) => {
        if (doc.uploaded_by) {
          (doc.uploaded_by as any).password = undefined;
        }

        (doc as any).url = getDocumentPublicUrl(
          supabaseUrl,
          SUPABASE_BUCKET,
          doc.file_path,
        );
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

      logInfo(
        `Documents fetched for user ${userId}, count: ${data.length}`,
        'DocumentService.findByUser',
      );

      return { data, metadata };
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
