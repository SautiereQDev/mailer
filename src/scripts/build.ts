import fs from 'fs';
import path from 'path';
import shell from 'shelljs';
import env from '@src/config';

// Type assertion for shelljs to fix ESLint errors
const sh = shell as {
  mkdir: (options: string, dir: string) => { code: number };
  rm: (options: string, path: string) => { code: number };
  cp: (options: string, source: string, dest: string | string[]) => { code: number };
  exec: (cmd: string) => { code: number };
};

// Ensure environment setup before building
const NODE_ENV = env.NODE_ENV ?? 'development';
const envPath = path.join(process.cwd(), `config/.env.${NODE_ENV}`);

// Check if the environment file exists, create it if needed
if (!fs.existsSync(path.join(process.cwd(), 'config'))) {
  sh.mkdir('-p', 'config');
}

if (!fs.existsSync(envPath)) {
  console.log(`Creating default .env.${NODE_ENV} file...`);
  const defaultEnv = `PORT=8081\nEMAIL_PASSWORD=default_password\n`;
  fs.writeFileSync(envPath, defaultEnv);
}

// Continue with build process
console.log('Building project...');
sh.rm('-rf', 'dist');
sh.mkdir('-p', 'dist');

// Compile TypeScript using production config
console.log('Compiling TypeScript...');
const tscResult = sh.exec('tsc --project tsconfig.prod.json --outDir dist');
if (tscResult.code !== 0) {
  throw new Error('TypeScript compilation failed');
}

// Copy necessary non-TypeScript files
console.log('Copying additional files...');
sh.cp('-R', 'src/views/emails', 'dist/views/');
sh.cp('-R', 'config', 'dist/config');
sh.cp('-R', 'package.json', 'dist/package.json');
sh.cp('-R', 'package-lock.json', 'dist/package-lock.json');
sh.cp('-R', 'ecosystem.config.js', 'dist/ecosystem.config.js');
sh.cp('-R', 'prisma', 'dist/prisma'); // Ajouter cette ligne

// Create a simple start script
const startScript = `#!/usr/bin/env node
require('./config');
require('./src/index.js');
`;
fs.writeFileSync(path.join(process.cwd(), 'dist', 'server.js'), startScript);

console.log('Build completed successfully');
