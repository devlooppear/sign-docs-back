import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './database.config';

export const AppDataSource = new DataSource(typeOrmConfig);
