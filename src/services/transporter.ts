import nodemailer from 'nodemailer';
import mailerConfig from '@src/config/mailer';

if (!process.env.EMAIL_PASSWORD) {
  throw new Error('EMAIL_PASSWORD is not defined');
}

export const transporter = nodemailer.createTransport(mailerConfig);

export default transporter;
