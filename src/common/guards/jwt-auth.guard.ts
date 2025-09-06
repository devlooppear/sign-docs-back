import { ExecutionContext, Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { logError, logWarn, logInfo } from '../../common/utils/log.util';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService, private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    try {
      const result = super.canActivate(context);
      logInfo('JWT guard activation check passed', 'JwtAuthGuard');
      return result;
    } catch (error) {
      logError(error, 'JwtAuthGuard.canActivate');
      throw new InternalServerErrorException('Error during JWT guard activation');
    }
  }

  handleRequest(err: any, user: any, info: any) {
    try {
      if (err || !user) {
        logWarn('Unauthorized request detected', 'JwtAuthGuard.handleRequest');
        throw err || new UnauthorizedException('Unauthorized');
      }
      logInfo(`User authenticated via JWT: ${user.id || 'unknown'}`, 'JwtAuthGuard.handleRequest');
      return user;
    } catch (error) {
      logError(error, 'JwtAuthGuard.handleRequest');
      throw error instanceof UnauthorizedException
        ? error
        : new InternalServerErrorException('Error handling JWT request');
    }
  }
}
