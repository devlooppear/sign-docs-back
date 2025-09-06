import { DataSourceOptions } from 'typeorm';
import * as path from 'path';
import { getCurrentEnv } from '../common/utils/get-current-env.util';
import { logInfo, logError } from '../common/utils/log.util';

const ENVIRONMENT = getCurrentEnv();

let typeOrmConfig: DataSourceOptions;

try {
  typeOrmConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: ENVIRONMENT === 'LOCAL',
    logging: ENVIRONMENT === 'LOCAL',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: [path.resolve(__dirname, '../resources/**/*.entity.{ts,js}')],
    migrations: [path.resolve(__dirname, '../migrations/*{.ts,.js}')],
    migrationsRun: false,
  };

  logInfo(
    `TypeORM config loaded for Postgres on environment: ${ENVIRONMENT}`,
    'TypeORM',
  );
} catch (error) {
  logError(error, 'TypeORM');
  throw error;
}

export { typeOrmConfig };
