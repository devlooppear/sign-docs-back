import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { AssinModule } from '../assin/assin.module';
import { Document } from '../document/entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Document]), AssinModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
