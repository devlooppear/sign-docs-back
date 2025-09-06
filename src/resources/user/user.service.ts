import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { logError, logInfo, logWarn } from '../../common/utils/log.util';
import { isStrongPassword } from 'class-validator';
import { TipoPessoa } from '../../common/enum/tipo-pessoa.enum';
import { isCNPJ, isCPF } from '../../common/utils/validation.util';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../../common/constants/pagination.const';
import {
  PaginationDto,
  PaginationMetaDto,
} from '../../common/dto/pagination.dto';
import { UserRole } from '../../common/enum/user-role.enum';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      if (!createUserDto) {
        throw new BadRequestException('Request body is required');
      }

      const {
        password,
        document_number,
        person_type = TipoPessoa.PF,
        ...rest
      } = createUserDto;

      if (!isStrongPassword(password)) {
        throw new BadRequestException(
          'Password is not strong enough. Must have at least 8 chars, upper, lower, number, special.',
        );
      }

      switch (person_type) {
        case TipoPessoa.PF:
          if (!isCPF(document_number)) {
            throw new BadRequestException('Invalid CPF for person type PF');
          }
          break;

        case TipoPessoa.PJ:
          if (!isCNPJ(document_number)) {
            throw new BadRequestException('Invalid CNPJ for person type PJ');
          }
          break;

        default:
          if (!isCPF(document_number)) {
            throw new BadRequestException(
              'Invalid CPF for default person type PF',
            );
          }
          break;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        ...rest,
        password: hashedPassword,
        person_type,
        role: rest.role || UserRole.CLIENT,
        document_number,
      });

      const savedUser = await this.userRepository.save(user);
      logInfo(`User created successfully: ${savedUser.id}`, 'UserService');
      return savedUser;
    } catch (error) {
      logError(error, 'UserService.create');
      throw error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Error creating user');
    }
  }

  async findAll(
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
  ): Promise<PaginationDto<User>> {
    try {
      const [users, totalItems] = await this.userRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        select: [
          'id',
          'name',
          'email',
          'role',
          'person_type',
          'document_number',
          'created_at',
          'updated_at',
        ],
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

      logInfo(`Retrieved ${users.length} users (page ${page})`, 'UserService');

      return {
        data: users,
        metadata,
      };
    } catch (error) {
      logError(error, 'UserService.findAll');
      throw new InternalServerErrorException('Error retrieving users');
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: [
          'id',
          'name',
          'email',
          'role',
          'person_type',
          'document_number',
          'created_at',
          'updated_at',
        ],
      });

      if (!user) {
        logWarn(`User with id ${id} not found`, 'UserService.findOne');
        throw new NotFoundException(`User with id ${id} not found`);
      }

      logInfo(`User retrieved: ${user.id}`, 'UserService');
      return user;
    } catch (error) {
      logError(error, 'UserService.findOne');
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Error retrieving user');
    }
  }
}
