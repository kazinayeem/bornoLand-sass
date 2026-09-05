const path = require('path');

// ============================================================================
// Atomic release deployment config
//
// Deployment layout on EC2:
//   ~/bornoLand-releases/
//     current -> release-<SHA>    ← symlink, updated atomically on deploy
//     release-abc123/
//       apps/api/
//         dist/index.js           ← tsup output (built on GitHub runner)
//         node_modules/           ← production deps only (pnpm deploy --prod)
//       apps/web/
//         .next/                  ← Next.js build output (built on GitHub runner)
//         public/                 ← static assets
//         package.json
//         node_modules/           ← production deps only (pnpm deploy --prod)
//
// On each deploy, the symlink is updated BEFORE pm2 reload.
// pm2 reload then starts a new worker with the new cwd (via symlink).
// ============================================================================

// Stable symlink — updated atomically during each deploy.
// Override with BORNOLAND_RELEASE_DIR env var if needed.
const RELEASE_BASE = process.env.BORNOLAND_RELEASE_DIR
  || path.join(process.env.HOME || '/home/ubuntu', 'bornoLand-releases/current');

module.exports = {
  apps: [
    {
      name: 'bornoland-api',
      // Entry: compiled by tsup on GitHub runner
      script: 'dist/index.js',
      cwd: path.join(RELEASE_BASE, 'apps/api'),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      // Conservative limit — prevents single process from starving the host.
      // EC2 has 7.6 GiB; MongoDB + Web + OS need headroom too.
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'bornoland-web',
      // Entry: Next.js production server (next start)
      // Uses the locally installed next binary from node_modules
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: path.join(RELEASE_BASE, 'apps/web'),
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
