"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const options = {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests max per IP
    message: 'Trop de tentatives, veuillez réessayer plus tard',
};
exports.limiter = (0, express_rate_limit_1.default)(options);
exports.default = exports.limiter;
