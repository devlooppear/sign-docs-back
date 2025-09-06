import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { Document } from './entities/document.entity';
import { User } from '../user/entities/user.entity';
import { Assin } from '../assin/entities/assin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, User, Assin])],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
