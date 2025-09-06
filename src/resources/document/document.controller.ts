import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DOC_MAX_FILE_SIZE } from '../../common/utils/validation.util';
import { UserRole } from '../../common/enum/user-role.enum';
import { AssignDocumentDto } from './dto/assign-doc.dto';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: DOC_MAX_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.documentService.uploadToStorage({
      file,
      uploadedById: req.user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  find(@Req() req) {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    return req.user.role === UserRole.ADMIN
      ? this.documentService.findAll(req.user, page, limit, status)
      : this.documentService.findByUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.documentService.remove(+id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('assign')
  async assignDocument(@Body() body: AssignDocumentDto, @Req() req) {
    return this.documentService.assignDocument({
      ...body,
      user: req.user,
    });
  }
}
