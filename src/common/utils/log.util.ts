import { Environment } from '../enum/environments.enum';
import * as process from 'process';

const ENV = process.env.ENVIRONMENT?.toUpperCase() || Environment.LOCAL;

export function logError(error: unknown, context?: string): void {
  const prefix = context ? `[ERROR][${context}] ` : '[ERROR] ';
  if (error instanceof Error) {
    console.error(`${prefix}${error.message}`, { stack: error.stack });
  } else {
    console.error(`${prefix}`, error);
  }
}

export function logInfo(message: string, context?: string): void {
  const prefix = context ? `[INFO][${context}] ` : '[INFO] ';
  console.log(`${prefix}${message}`);
}

export function logWarn(message: string, context?: string): void {
  const prefix = context ? `[WARN][${context}] ` : '[WARN] ';
  console.warn(`${prefix}${message}`);
}