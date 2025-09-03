import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import path from 'path';
import { getCurrentEnv } from '../common/utils/get-current-env';

dotenv.config();

let typeOrmConfig: DataSourceOptions;

try {
  const DB_TYPE = process.env.DB_TYPE as any;
  const DATABASE_URL = process.env.DATABASE_URL;
  const ENVIRONMENT = getCurrentEnv();

  if (!DB_TYPE) {
    throw new Error('DB_TYPE is not defined in .env');
  }

  typeOrmConfig = {
    type: DB_TYPE,
    url: DATABASE_URL,
    synchronize: ENVIRONMENT === 'LOCAL',
    logging: ENVIRONMENT === 'LOCAL',
    entities: [path.resolve(__dirname, '../resources/**/*.entity.{ts,js}')],
    migrations: [path.resolve(__dirname, '../migrations/*{.ts,.js}')],
    migrationsRun: false,
  };

  console.log(`TypeORM config loaded for DB: ${DB_TYPE} on ${ENVIRONMENT}`);
} catch (error) {
  console.error('Error loading TypeORM config:', error);
  throw error;
}

export { typeOrmConfig };
