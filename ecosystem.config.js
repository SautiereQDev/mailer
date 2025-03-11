const dotenv = require('dotenv');
dotenv.config({
  path: `.env.${process.env.NODE_ENV ?? 'production'}`,
});

module.exports = {
  apps: [
    {
      name: 'mailer',
      command: 'npm run start',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8081,
        HOST: '0.0.0.0',
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'password',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
