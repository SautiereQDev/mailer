import path from 'path';
import moduleAlias from 'module-alias';
import dotenv from 'dotenv';

// eslint-disable-next-line n/no-process-env
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const envPath = path.join(process.cwd(), `.env.${NODE_ENV}`);

// Correction : passer un objet avec la propriété path
dotenv.config({ path: envPath });

// eslint-disable-next-line n/no-process-env
if (!process.env) {
  console.warn(`Warning: Could not load ${envPath}. Using default environment variables.`);
} else {
  console.log(`Environment variables loaded successfully from ${envPath}`);
}

// Configure moduleAlias
if (__filename.endsWith('ts')) {
  moduleAlias.addAlias('@src', path.join(process.cwd(), 'dist'));
}

// Export environment variables for use in other files
export default {
  NODE_ENV,
  DB_PATH: process.env.DB_PATH ?? './data/apikeys.sqlite',
  PORT: parseInt(process.env.PORT ?? '8081', 10),
  JWT_SECRET: process.env.JWT_SECRET ?? 'default-dev-secret',
  HOST: process.env.HOST ?? 'localhost',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ?? 'enter_your_email_password_here',
  JET_LOGGER_MODE: process.env.JET_LOGGER_MODE ?? 'CONSOLE',
  JET_LOGGER_FILEPATH: process.env.JET_LOGGER_FILEPATH ?? 'jet-logger.log',
  JET_LOGGER_TIMESTAMP: process.env.JET_LOGGER_TIMESTAMP ?? 'TRUE',
  JET_LOGGER_FORMAT: process.env.JET_LOGGER_FORMAT ?? 'LINE',
  DISABLE_HELMET: process.env.DISABLE_HELMET === 'TRUE',
  DATABASE_URL:
    process.env.DATABASE_URL ?? `file:${process.env.DB_PATH ?? './data/apikeys.sqlite'}`,
};
