import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { logError, logInfo } from '../../common/utils/log.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    try {
      const secret = configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new InternalServerErrorException(
          'JWT_SECRET is not defined in .env',
        );
      }

      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: secret,
      });

      logInfo('JWT Strategy initialized successfully', 'JwtStrategy');
    } catch (error) {
      logError(error, 'JwtStrategy.constructor');
      throw error;
    }
  }

  async validate(payload: any) {
    try {
      return { userId: payload.sub, role: payload.role };
    } catch (error) {
      logError(error, 'JwtStrategy.validate');
      throw new InternalServerErrorException('Error validating JWT payload');
    }
  }
}
