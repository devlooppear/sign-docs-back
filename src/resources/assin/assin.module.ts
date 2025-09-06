import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssinService } from './assin.service';
import { AssinController } from './assin.controller';
import { Assin } from './entities/assin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assin])],
  controllers: [AssinController],
  providers: [AssinService],
  exports: [AssinService],
})
export class AssinModule {}
