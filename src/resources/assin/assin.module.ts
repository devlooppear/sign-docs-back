import { Module } from '@nestjs/common';
import { AssinService } from './assin.service';
import { AssinController } from './assin.controller';

@Module({
  controllers: [AssinController],
  providers: [AssinService],
})
export class AssinModule {}
