module.exports = {
  apps: [
    {
      name: 'mailer',
      script: './start-prod.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
