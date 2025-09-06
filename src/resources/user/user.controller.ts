import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from './entities/user.entity';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../../common/constants/pagination.const';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginationDto<User>> {
    const pageNumber = page ? parseInt(page, 10) : DEFAULT_PAGE;
    const limitNumber = limit ? parseInt(limit, 10) : DEFAULT_LIMIT;
    return this.userService.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
}
