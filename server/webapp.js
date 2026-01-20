const express = require('express');
const path = require('path');

const WEBAPP_PORT = process.env.WEBAPP_PORT || 3001;

function createWebappServer() {
  const app = express();

  // Health check endpoint (with CORS for status checks from homepage)
  app.get('/health', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ status: 'ok', service: 'webapp', timestamp: new Date().toISOString() });
  });

  // Serve static files from webapp directory
  app.use(express.static(path.join(__dirname, '../webapp')));

  // SPA fallback - serve index.html for all routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../webapp/index.html'));
  });

  return app;
}

function startWebappServer() {
  const app = createWebappServer();
  app.listen(WEBAPP_PORT, () => {
    console.log(`Webapp server listening on port ${WEBAPP_PORT}`);
  });
  return app;
}

module.exports = { createWebappServer, startWebappServer };
