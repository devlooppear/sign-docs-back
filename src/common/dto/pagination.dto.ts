import { Type } from 'class-transformer';
import { IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Número da página atual' })
  @IsInt()
  @Min(1)
  page: number;

  @ApiProperty({ example: 10, description: 'Quantidade de itens por página' })
  @IsInt()
  @Min(1)
  size: number;

  @ApiProperty({ example: 100, description: 'Número total de itens' })
  @IsInt()
  @Min(0)
  totalItems: number;

  @ApiProperty({ example: 10, description: 'Número total de páginas' })
  @IsInt()
  @Min(0)
  totalPages: number;

  @ApiProperty({
    example: true,
    description: 'Indica se existe próxima página',
  })
  @IsBoolean()
  hasNextPage: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica se existe página anterior',
  })
  @IsBoolean()
  hasPreviousPage: boolean;
}

@ApiExtraModels(PaginationMetaDto)
export class PaginationDto<T> {
  @ApiProperty({
    type: 'array',
    description: 'Lista de itens da página',
    items: { type: 'object' },
  })
  @Type(() => Object)
  data: T[];

  @ApiProperty({ type: () => PaginationMetaDto })
  @Type(() => PaginationMetaDto)
  metadata: PaginationMetaDto;
}
