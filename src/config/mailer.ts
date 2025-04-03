import env from '@src/config';

export const mailerConfig = {
  host: 'smtp.ionos.fr',
  port: 465,
  secure: true,
  auth: {
    user: 'contact@quentinsautiere.com',

    pass: env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

export default mailerConfig;
