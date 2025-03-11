"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailerConfig = void 0;
const ENV_1 = __importDefault(require("@src/common/ENV"));
exports.mailerConfig = {
    host: 'smtp.ionos.fr', // SMTP au lieu de IMAP
    port: 465,
    secure: true,
    auth: {
        user: 'contact@quentinsautiere.com',
        // eslint-disable-next-line n/no-process-env
        pass: ENV_1.default.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
};
exports.default = exports.mailerConfig;
