import { Router } from 'express';
import limiter from '@src/midlewares/rateLimiter';
import apiKeyAuth from '@src/midlewares/apiKeyAuth';
import { MailerController } from '../controllers/mailerController';

export const baseRoutes = Router();

baseRoutes.get('/', (req, res) => MailerController.getMailerInfo(req, res));
baseRoutes.post('/send', apiKeyAuth, limiter, (req, res) => MailerController.sendEmail(req, res));

export default baseRoutes;
