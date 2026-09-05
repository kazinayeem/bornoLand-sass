const path = require('path');

// ============================================================================
// PM2 Ecosystem — git-based deployment
//
// Deployment directory on EC2:
//   ~/bornoLand-sass/          ← git repository (git reset --hard on deploy)
//     apps/api/dist/index.js   ← built by tsup
//     apps/web/.next/          ← built by next build
//     apps/web/node_modules/   ← installed by pnpm install
//
// PM2 reads this file and starts processes from the repo working tree.
// ============================================================================

const REPO_DIR = process.env.BORNOLAND_REPO_DIR
  || path.join(process.env.HOME || '/home/ubuntu', 'bornoLand-sass');

module.exports = {
  apps: [
    {
      name: 'bornoland-api',
      script: 'dist/index.js',
      cwd: path.join(REPO_DIR, 'apps/api'),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'bornoland-web',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: path.join(REPO_DIR, 'apps/web'),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
