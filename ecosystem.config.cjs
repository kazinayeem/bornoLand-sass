const path = require('path');

// Resolve the base release directory containing this ecosystem file
const releaseDir = __dirname;

module.exports = {
  apps: [
    {
      name: 'bornoland-api',
      script: 'dist/index.js',
      cwd: path.resolve(releaseDir, 'apps/api'),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'bornoland-web',
      script: 'server.js',
      cwd: path.resolve(releaseDir, 'apps/web'),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
