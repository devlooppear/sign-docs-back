import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './config/database.config';
import * as dotenv from 'dotenv';
import getPort from 'get-port';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Environment } from './common/enum/environments.enum';
import { getCurrentEnv } from './common/utils/get-current-env';
import { logInfo, logError } from './common/utils/log.util';

dotenv.config();

async function bootstrap() {
  try {
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

    const dataSource = new DataSource(typeOrmConfig);
    await dataSource.initialize();
    logInfo('Database conectado com sucesso', 'Bootstrap');

    if (environment !== Environment.PRODUCTION) {
      const swaggerConfig = new DocumentBuilder()
        .setTitle('API - Plataforma de Assinatura Digital')
        .setDescription(
          'API para gerenciamento de usuários (admin e clientes), ' +
            'cadastro e assinatura de documentos financeiros. ' +
            'Permite admins cadastrarem documentos e clientes assinarem digitalmente.',
        )
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Insira o token JWT para autenticação',
          },
          'access-token',
        )
        .build();

      const document = SwaggerModule.createDocument(app, swaggerConfig);
      SwaggerModule.setup('api-docs', app, document);
      logInfo('Swagger configurado e disponível em /api-docs', 'Bootstrap');
    }

    const initialPort = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const portsToTry = Array.from({ length: 100 }, (_, i) => initialPort + i);
    const port = await getPort({ port: portsToTry });

    await app.listen(port);
    logInfo(`Server rodando na porta ${port}`, 'Bootstrap');
  } catch (error) {
    logError(error, 'Bootstrap');
    process.exit(1);
  }
}

bootstrap();
