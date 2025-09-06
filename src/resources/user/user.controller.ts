
import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../../common/enum/user-role.enum';
import { getUserFromRequest } from '../../common/utils/user.util';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    const userPayload = getUserFromRequest(req);
    return this.userService.findOne(userPayload.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async listUsers(@Req() req) {
    const userPayload = getUserFromRequest(req);
    if (userPayload.role === UserRole.ADMIN) {
      const result = await this.userService.findAll();
      return result.data;
    } else if (userPayload.role === UserRole.CLIENT) {
      const user = await this.userService.findOne(userPayload.userId);
      return [user];
    }
    return { error: 'Unauthorized' };
  }
}
