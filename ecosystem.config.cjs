module.exports = {
  apps: [
    {
      name: 'farmdirect-api',
      script: 'server/index.js',
      cwd: '/var/www/farmdirect',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
