import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssinDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  codigo: number;

  @IsString()
  @IsOptional()
  signature_hash?: string;
}