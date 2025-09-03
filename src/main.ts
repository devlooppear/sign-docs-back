import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './config/database.config';
import * as dotenv from 'dotenv';
import getPort from 'get-port';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Environment } from './common/enum/environments.enum';
import { getCurrentEnv } from './common/utils/get-current-env';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const environment = getCurrentEnv();

  const allowedOrigin =
    environment === Environment.PRODUCTION ? process.env.FRONTEND_URL : '*';

  app.enableCors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
    exposedHeaders: '*',
  });

  /*   const dataSource = new DataSource(typeOrmConfig);
  await dataSource.initialize(); */

  if (environment !== Environment.PRODUCTION) {
    console.log('Database connected');

    const config = new DocumentBuilder()
      .setTitle('FitScore API')
      .setDescription(
        'API for user management, FitScore submissions and notifications. ' +
          'Allows candidates to submit assessments and recruiters to view dashboards.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  const initialPort = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const portsToTry = Array.from({ length: 100 }, (_, i) => initialPort + i);
  const port = await getPort({ port: portsToTry });

  await app.listen(port);

  if (environment !== Environment.PRODUCTION) {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
  }
}

bootstrap();
