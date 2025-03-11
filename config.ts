/* eslint-disable n/no-process-env */

import path from 'path';
import dotenv from 'dotenv';
import moduleAlias from 'module-alias';

// Check the env
const NODE_ENV = process.env.NODE_ENV ?? 'development';

// Make sure we have the correct path to config files
const envPath = path.join(process.cwd(), `config/.env.${NODE_ENV}`);

// Configure "dotenv"
const result = dotenv.config({
  path: envPath,
});

if (result.error) {
  console.warn(`Warning: Could not load ${envPath}. Using default environment variables.`);
} else {
  console.log(`Environment variables loaded successfully from ${envPath}`);
}

// Configure moduleAlias
if (__filename.endsWith('js')) {
  moduleAlias.addAlias('@src', path.join(process.cwd(), 'dist'));
}

// Export environment variables for use in other files
export default {
  NODE_ENV,
  PORT: process.env.PORT ?? 8081,
  // Add other environment variables as needed
};
