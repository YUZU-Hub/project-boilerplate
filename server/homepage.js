const express = require('express');
const path = require('path');

const HOMEPAGE_PORT = process.env.HOMEPAGE_PORT || 3000;
const WEBAPP_PORT = process.env.WEBAPP_PORT;
const WEBAPP_PATH = process.env.WEBAPP_PATH || '/';
const ADMIN_PORT = process.env.ADMIN_PORT;
const ADMIN_PATH = process.env.ADMIN_PATH || '/admin';

function createHomepageServer() {
  const app = express();

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'homepage', timestamp: new Date().toISOString() });
  });

  // If WEBAPP_PORT is empty, mount webapp at WEBAPP_PATH
  if (!WEBAPP_PORT && WEBAPP_PATH !== '/') {
    console.log(`Mounting webapp at ${WEBAPP_PATH}`);
    app.use(WEBAPP_PATH, express.static(path.join(__dirname, '../webapp')));
    // SPA fallback for webapp
    app.get(`${WEBAPP_PATH}/*`, (req, res) => {
      res.sendFile(path.join(__dirname, '../webapp/index.html'));
    });
  }

  // If ADMIN_PORT is empty, mount admin at ADMIN_PATH
  if (!ADMIN_PORT) {
    console.log(`Mounting admin at ${ADMIN_PATH}`);
    const { createAdminRouter } = require('./admin');
    app.use(ADMIN_PATH, createAdminRouter());
  }

  // Serve static files from homepage directory
  app.use(express.static(path.join(__dirname, '../homepage')));

  // Fallback to index.html for SPA-like behavior
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../homepage/index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).send('Page not found');
      }
    });
  });

  return app;
}

function startHomepageServer() {
  const app = createHomepageServer();
  app.listen(HOMEPAGE_PORT, () => {
    console.log(`Homepage server listening on port ${HOMEPAGE_PORT}`);
  });
  return app;
}

module.exports = { createHomepageServer, startHomepageServer };
