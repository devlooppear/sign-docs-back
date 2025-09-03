import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentStatus } from '../../../common/enum/document-status.enum';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  file_path: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  uploadedById: number;

  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;
}
