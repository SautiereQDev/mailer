"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailSchema = void 0;
const zod_1 = require("zod");
exports.mailSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50).trim(),
    company: zod_1.z.string().max(100).trim().optional(),
    email: zod_1.z.string().email().toLowerCase().trim(),
    message: zod_1.z.string().min(10).max(1000).trim(),
});
