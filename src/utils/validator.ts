import { z } from 'zod';

export const mailSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  company: z.string().max(100).trim().optional(),
  email: z.string().email().toLowerCase().trim(),
  message: z.string().min(10).max(1000).trim(),
});

export type MailInput = z.infer<typeof mailSchema>;
