import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  PaginationDto,
  PaginationMetaDto,
} from '../../common/dto/pagination.dto';
import {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
} from '../../common/constants/pagination.const';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assin } from './entities/assin.entity';
import { User } from '../user/entities/user.entity';
import * as crypto from 'crypto';
import { logError } from '../../common/utils/log.util';

@Injectable()
export class AssinService {
  constructor(
    @InjectRepository(Assin)
    private readonly assinRepository: Repository<Assin>,
  ) {}

  async findAll(
    page: number = DEFAULT_PAGE,
    size: number = DEFAULT_LIMIT,
  ): Promise<PaginationDto<Assin>> {
    try {
      const [data, totalItems] = await this.assinRepository.findAndCount({
        relations: ['user'],
        order: { signed_at: 'DESC' },
        skip: (page - 1) * size,
        take: size,
      });

      const totalPages = Math.ceil(totalItems / size);
      const metadata: PaginationMetaDto = {
        page,
        size,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };

      return { data, metadata };
    } catch (error) {
      logError(error, 'AssinService.findAll');
      throw new InternalServerErrorException('Erro ao listar assinaturas');
    }
  }

  async findByUser(userId: number): Promise<Assin[]> {
    try {
      const assinaturas = await this.assinRepository.find({
        where: { user: { id: userId } },
        relations: ['user'],
        order: { signed_at: 'DESC' },
      });

      return assinaturas;
    } catch (error) {
      logError(error, 'AssinService.findByUser');
      throw new InternalServerErrorException(
        'Erro ao buscar assinaturas do usuário',
      );
    }
  }

  async findOne(id: number): Promise<Assin | null> {
    try {
      const assinatura = await this.assinRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!assinatura) {
        return null;
      }

      return assinatura;
    } catch (error) {
      logError(error, 'AssinService.findOne');
      throw new InternalServerErrorException('Erro ao buscar assinatura');
    }
  }

  async create(user: User): Promise<Assin> {
    try {
      const code = Date.now();

      const hashObject = {
        userId: user.id,
        userName: user.name,
        userDocument: user.document_number,
      };

      const rawString = JSON.stringify(hashObject);

      const signature_hash = crypto
        .createHash('sha1')
        .update(rawString)
        .digest('hex');

      const assinatura = this.assinRepository.create({
        user,
        code,
        signature_hash,
      });

      const saved = await this.assinRepository.save(assinatura);

      return saved;
    } catch (error) {
      logError(error, 'AssinService.create');
      throw new BadRequestException('Erro ao criar assinatura');
    }
  }
}
