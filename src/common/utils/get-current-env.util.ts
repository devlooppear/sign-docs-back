import * as dotenv from 'dotenv';
import { Environment } from '../enum/environments.enum';

dotenv.config();

export function getCurrentEnv(): Environment {
  const env = process.env.ENVIRONMENT || Environment.LOCAL;
  return env.toUpperCase() as Environment;
}
