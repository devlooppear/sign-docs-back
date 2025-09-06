import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CPF_CNPJ_REGEX } from '../../../common/utils/validation.util';

export class CreateAssinDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  documentId: number;

  @IsString()
  @IsNotEmpty()
  @Matches(CPF_CNPJ_REGEX, {
    message:
      'CPF ou CNPJ inválido',
  })
  cpf_cnpj: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  codigo: number;

  @IsString()
  @IsOptional()
  signature_hash?: string;
}
