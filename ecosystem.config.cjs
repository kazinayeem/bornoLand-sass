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
//       apps/web/                 ← Next.js standalone output (standalone/* copied here)
//         server.js               ← proxy entry: require('./apps/web/server.js')
//         apps/web/
//           server.js             ← real Next.js server (7 KB, __dirname-relative)
//           .next/                ← server chunks + static/ already included
//           public/               ← static assets already included
//         node_modules/           ← bundled by Next.js (next, react)
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
      // Entry: Next.js standalone server (self-contained, no separate install needed)
      // next.config.ts has output:'standalone' + outputFileTracingRoot set to monorepo root.
      // Packaging: standalone/* is copied directly into apps/web/ so the proxy lives at:
      //   apps/web/server.js → require('./apps/web/server.js') → real Next.js server
      script: 'server.js',
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

