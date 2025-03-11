export const mailerConfig = {
  host: 'smtp.ionos.fr', // SMTP au lieu de IMAP
  port: 465,
  secure: true,
  auth: {
    user: 'contact@quentinsautiere.com',
    // eslint-disable-next-line n/no-process-env
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

export default mailerConfig;
