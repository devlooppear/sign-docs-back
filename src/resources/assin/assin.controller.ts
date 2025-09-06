import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AssinService } from './assin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../../common/enum/user-role.enum';
import {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
} from '../../common/constants/pagination.const';
import { getUserFromRequest } from '../../common/utils/user.util';

@Controller('assin')
export class AssinController {
  constructor(private readonly assinService: AssinService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  find(@Req() req) {
    const userPayload = getUserFromRequest(req);
    const page = req.query.page ? Number(req.query.page) : DEFAULT_PAGE;
    const size = req.query.size ? Number(req.query.size) : DEFAULT_LIMIT;
    if (userPayload.role === UserRole.ADMIN) {
      return this.assinService.findAll(page, size);
    } else if (userPayload.role === UserRole.CLIENT) {
      return this.assinService.findByUser(userPayload.userId);
    }
    return { error: 'Unauthorized' };
  }
}
