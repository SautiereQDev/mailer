"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailer_1 = __importDefault(require("@src/config/mailer"));
const ENV_1 = __importDefault(require("@src/common/ENV"));
if (!ENV_1.default.EMAIL_PASSWORD) {
    throw new Error('EMAIL_PASSWORD is not defined');
}
exports.transporter = nodemailer_1.default.createTransport(mailer_1.default);
exports.default = exports.transporter;
