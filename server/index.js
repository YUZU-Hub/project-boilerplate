/**
 * Main entry point for Node.js servers
 *
 * Starts servers based on configuration:
 * - Homepage server always starts
 * - Webapp server starts if WEBAPP_PORT is set
 * - Admin server starts if ADMIN_PORT is set
 *
 * Environment variables:
 * - HOMEPAGE_PORT: Port for homepage server (default: 3000)
 * - WEBAPP_PORT: Port for webapp server (default: 3001, empty = mount on homepage)
 * - WEBAPP_PATH: Path prefix when mounted on homepage (default: /)
 * - ADMIN_PORT: Port for admin server (default: 3002, empty = mount on homepage)
 * - ADMIN_PATH: Path prefix when mounted on homepage (default: /admin)
 * - API_URL: PocketBase URL (default: http://localhost:8090)
 */

const { startHomepageServer } = require('./homepage');
const { startWebappServer } = require('./webapp');
const { startAdminServer } = require('./admin');

const WEBAPP_PORT = process.env.WEBAPP_PORT;
const ADMIN_PORT = process.env.ADMIN_PORT;

console.log('Starting Node.js servers...');
console.log(`Configuration:`);
console.log(`  HOMEPAGE_PORT: ${process.env.HOMEPAGE_PORT || 3000}`);
console.log(`  WEBAPP_PORT: ${WEBAPP_PORT || '(mounted on homepage)'}`);
console.log(`  WEBAPP_PATH: ${process.env.WEBAPP_PATH || '/'}`);
console.log(`  ADMIN_PORT: ${ADMIN_PORT || '(mounted on homepage)'}`);
console.log(`  ADMIN_PATH: ${process.env.ADMIN_PATH || '/admin'}`);
console.log(`  API_URL: ${process.env.API_URL || 'http://localhost:8090'}`);
console.log('');

// Always start homepage server
startHomepageServer();

// Start webapp server if port is configured
if (WEBAPP_PORT) {
  startWebappServer();
}

// Start admin server if port is configured
if (ADMIN_PORT) {
  startAdminServer();
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});
