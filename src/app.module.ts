import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './resources/user/user.module';
import { DocumentModule } from './resources/document/document.module';
import { AssinModule } from './resources/assin/assin.module';

@Module({
  imports: [UserModule, DocumentModule, AssinModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
