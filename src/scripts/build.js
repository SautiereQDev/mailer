"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const shelljs_1 = __importDefault(require("shelljs"));
// Ensure environment setup before building
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const envPath = path_1.default.join(process.cwd(), `config/.env.${NODE_ENV}`);
// Check if the environment file exists, create it if needed
if (!fs_1.default.existsSync(path_1.default.join(process.cwd(), 'config'))) {
    shelljs_1.default.mkdir('-p', 'config');
}
if (!fs_1.default.existsSync(envPath)) {
    console.log(`Creating default .env.${NODE_ENV} file...`);
    const defaultEnv = `PORT=8081\nEMAIL_PASSWORD=default_password\n`;
    fs_1.default.writeFileSync(envPath, defaultEnv);
}
// Continue with build process
console.log('Building project...');
shelljs_1.default.rm('-rf', 'dist');
shelljs_1.default.mkdir('-p', 'dist');
shelljs_1.default.cp('-R', 'src/views', 'dist/');
// Compile TypeScript
const result = shelljs_1.default.exec('tsc --build tsconfig.json');
if (result.code !== 0) {
    console.error('Error: TypeScript compilation failed');
    process.exit(1);
}
console.log('Build completed successfully');
