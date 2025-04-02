import env from './config';

export const mailerConfig = {
  host: 'smtp.ionos.fr',
  port: 465,
  secure: true,
  auth: {
    user: 'contact@quentinsautiere.com',
    // eslint-disable-next-line n/no-process-env
    pass: env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

export default mailerConfig;
