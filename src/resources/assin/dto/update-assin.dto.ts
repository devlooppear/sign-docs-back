import { PartialType } from '@nestjs/swagger';
import { CreateAssinDto } from './create-assin.dto';

export class UpdateAssinDto extends PartialType(CreateAssinDto) {}
