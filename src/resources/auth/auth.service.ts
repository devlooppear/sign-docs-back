import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { logError, logInfo, logWarn } from '../../common/utils/log.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (user && (await bcrypt.compare(password, user.password))) {
        logInfo(`User validated successfully: ${user.id}`, 'AuthService.validateUser');
        return user;
      }
      logWarn(`Invalid credentials for email: ${email}`, 'AuthService.validateUser');
      return null;
    } catch (error) {
      logError(error, 'AuthService.validateUser');
      throw new InternalServerErrorException('Error validating user');
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.validateUser(email, password);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password: _, ...userData } = user;
      const token = this.jwtService.sign({ sub: user.id, role: user.role });

      logInfo(`User logged in: ${user.id}`, 'AuthService.login');

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      logError(error, 'AuthService.login');
      throw error instanceof UnauthorizedException
        ? error
        : new InternalServerErrorException('Error during login');
    }
  }
}
