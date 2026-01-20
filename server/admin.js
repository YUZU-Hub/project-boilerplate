const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { spawn } = require('child_process');

const ADMIN_PORT = process.env.ADMIN_PORT || 3002;
const API_URL = process.env.API_URL || 'http://localhost:8090';

// Simple in-memory log storage (last 100 entries)
const requestLogs = [];
const errorLogs = [];
const applicationLogs = [];
const MAX_LOGS = 100;
const MAX_APP_LOGS = 500;

// Analytics data - rolling window
const analyticsData = {
  requests: [],  // { timestamp, duration, status }
  maxEntries: 1000
};

function addLog(logs, entry, max = MAX_LOGS) {
  logs.unshift({ ...entry, timestamp: new Date().toISOString() });
  if (logs.length > max) logs.pop();
}

function addAnalyticsEntry(entry) {
  analyticsData.requests.unshift({ ...entry, timestamp: Date.now() });
  if (analyticsData.requests.length > analyticsData.maxEntries) {
    analyticsData.requests.pop();
  }
}

// Log streaming clients (SSE)
const logStreamClients = new Set();

function broadcastLog(type, data) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  logStreamClients.forEach(client => {
    client.write(`data: ${message}\n\n`);
  });
}

// Capture application logs
function captureLog(level, message, source = 'app') {
  const entry = { level, message, source, timestamp: new Date().toISOString() };
  addLog(applicationLogs, entry, MAX_APP_LOGS);
  broadcastLog('log', entry);
}

// Override console to capture logs
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

console.log = (...args) => {
  originalConsole.log(...args);
  captureLog('info', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'node');
};

console.error = (...args) => {
  originalConsole.error(...args);
  captureLog('error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'node');
};

console.warn = (...args) => {
  originalConsole.warn(...args);
  captureLog('warn', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'node');
};

// CORS middleware for health endpoint
function corsForHealth(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}

// Auth middleware - validates PocketBase admin token
async function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.slice(7);
  req.adminToken = token;

  try {
    // Verify token with PocketBase (0.25+ uses _superusers collection)
    const response = await fetch(`${API_URL}/api/collections/_superusers/auth-refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid admin token' });
    }

    next();
  } catch (err) {
    originalConsole.error('Auth verification error:', err.message);
    return res.status(503).json({ error: 'Cannot verify token with PocketBase' });
  }
}

// Auth middleware for SSE (token in query string)
async function requireAdminAuthSSE(req, res, next) {
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  req.adminToken = token;

  try {
    const response = await fetch(`${API_URL}/api/collections/_superusers/auth-refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid admin token' });
    }

    next();
  } catch (err) {
    originalConsole.error('Auth verification error:', err.message);
    return res.status(503).json({ error: 'Cannot verify token with PocketBase' });
  }
}

// Get system metrics
function getSystemMetrics() {
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  // Calculate CPU usage
  let totalIdle = 0;
  let totalTick = 0;
  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  const cpuUsage = 100 - (totalIdle / totalTick * 100);

  return {
    cpu: {
      usage: Math.round(cpuUsage * 100) / 100,
      cores: cpus.length,
      model: cpus[0]?.model || 'Unknown'
    },
    memory: {
      total: totalMemory,
      used: usedMemory,
      free: freeMemory,
      usagePercent: Math.round((usedMemory / totalMemory) * 10000) / 100
    },
    uptime: os.uptime(),
    loadAverage: os.loadavg()
  };
}

// Get disk usage (basic implementation)
function getDiskUsage() {
  try {
    // Try to get disk usage for the data directory
    const dataPath = path.join(__dirname, '../api/pb_data');
    if (fs.existsSync(dataPath)) {
      const stats = fs.statfsSync ? fs.statfsSync(dataPath) : null;
      if (stats) {
        return {
          total: stats.blocks * stats.bsize,
          free: stats.bfree * stats.bsize,
          used: (stats.blocks - stats.bfree) * stats.bsize
        };
      }
    }
  } catch (err) {
    // Ignore errors, disk info is optional
  }
  return null;
}

// Check service health
async function checkServices() {
  const services = [
    { name: 'homepage', port: process.env.HOMEPAGE_PORT || 3000 },
    { name: 'webapp', port: process.env.WEBAPP_PORT },
    { name: 'admin', port: process.env.ADMIN_PORT },
    { name: 'pocketbase', url: `${API_URL}/api/health` }
  ].filter(s => s.port || s.url);

  const results = await Promise.all(services.map(async (service) => {
    try {
      const url = service.url || `http://localhost:${service.port}/health`;
      const response = await fetch(url, { timeout: 5000 });
      return {
        name: service.name,
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status
      };
    } catch (err) {
      return {
        name: service.name,
        status: 'unreachable',
        error: err.message
      };
    }
  }));

  return results;
}

// Get PocketBase collections with record counts
async function getCollections(token) {
  try {
    const response = await fetch(`${API_URL}/api/collections`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status}`);
    }

    const data = await response.json();
    const collections = data.items || data || [];

    // Get record counts for each collection (skip system collections)
    const collectionsWithCounts = await Promise.all(
      collections
        .filter(c => !c.name.startsWith('_'))
        .map(async (collection) => {
          try {
            const countResponse = await fetch(
              `${API_URL}/api/collections/${collection.name}/records?perPage=1`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const countData = await countResponse.json();
            return {
              name: collection.name,
              type: collection.type,
              recordCount: countData.totalItems || 0
            };
          } catch (err) {
            return {
              name: collection.name,
              type: collection.type,
              recordCount: null,
              error: err.message
            };
          }
        })
    );

    // Get database size
    let dbSize = null;
    const dbPath = path.join(__dirname, '../api/pb_data/data.db');
    try {
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        dbSize = stats.size;
      }
    } catch (err) {
      // Ignore
    }

    return {
      collections: collectionsWithCounts,
      totalCollections: collectionsWithCounts.length,
      databaseSize: dbSize
    };
  } catch (err) {
    throw err;
  }
}

// Get request analytics
function getAnalytics(period = '1h') {
  const now = Date.now();
  const periods = {
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000
  };

  const cutoff = now - (periods[period] || periods['1h']);
  const recentRequests = analyticsData.requests.filter(r => r.timestamp > cutoff);

  if (recentRequests.length === 0) {
    return {
      period,
      totalRequests: 0,
      requestsPerMinute: 0,
      avgResponseTime: 0,
      errorRate: 0,
      statusCodes: {},
      timeline: []
    };
  }

  // Calculate metrics
  const totalRequests = recentRequests.length;
  const periodMinutes = (periods[period] || periods['1h']) / 60000;
  const requestsPerMinute = Math.round((totalRequests / periodMinutes) * 100) / 100;

  const totalDuration = recentRequests.reduce((sum, r) => sum + (r.duration || 0), 0);
  const avgResponseTime = Math.round(totalDuration / totalRequests);

  const errorCount = recentRequests.filter(r => r.status >= 400).length;
  const errorRate = Math.round((errorCount / totalRequests) * 10000) / 100;

  // Status code distribution
  const statusCodes = {};
  recentRequests.forEach(r => {
    const category = `${Math.floor(r.status / 100)}xx`;
    statusCodes[category] = (statusCodes[category] || 0) + 1;
  });

  // Timeline data (requests per minute for the last N intervals)
  const intervalMs = period === '24h' ? 60 * 60 * 1000 : 60 * 1000; // hourly for 24h, otherwise per minute
  const intervals = period === '24h' ? 24 : Math.min(60, Math.ceil(periodMinutes));
  const timeline = [];

  for (let i = 0; i < intervals; i++) {
    const intervalEnd = now - (i * intervalMs);
    const intervalStart = intervalEnd - intervalMs;
    const count = recentRequests.filter(r => r.timestamp >= intervalStart && r.timestamp < intervalEnd).length;
    timeline.unshift({
      time: new Date(intervalStart).toISOString(),
      count
    });
  }

  return {
    period,
    totalRequests,
    requestsPerMinute,
    avgResponseTime,
    errorRate,
    statusCodes,
    timeline
  };
}

// Get environment info (non-sensitive)
function getEnvironmentInfo() {
  const safeEnvVars = [
    'NODE_ENV',
    'HOMEPAGE_PORT',
    'WEBAPP_PORT',
    'WEBAPP_PATH',
    'ADMIN_PORT',
    'ADMIN_PATH',
    'API_URL'
  ];

  const env = {};
  safeEnvVars.forEach(key => {
    if (process.env[key]) {
      env[key] = process.env[key];
    }
  });

  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    env
  };
}

// Get PocketBase version
async function getPocketBaseVersion() {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    return data.code ? 'healthy' : 'unknown';
  } catch (err) {
    return 'unreachable';
  }
}

// List backups
async function listBackups(token) {
  try {
    const response = await fetch(`${API_URL}/api/backups`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list backups: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    throw err;
  }
}

// Create backup
async function createBackup(token, name) {
  try {
    const response = await fetch(`${API_URL}/api/backups`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: name || `backup_${Date.now()}` })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Failed to create backup: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    throw err;
  }
}

// Delete backup
async function deleteBackup(token, key) {
  try {
    const response = await fetch(`${API_URL}/api/backups/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete backup: ${response.status}`);
    }

    return { success: true };
  } catch (err) {
    throw err;
  }
}

// Create admin router (for mounting at a path)
function createAdminRouter() {
  const router = express.Router();

  // Health check (no auth required, with CORS for status checks from homepage)
  router.get('/health', corsForHealth, (req, res) => {
    res.json({ status: 'ok', service: 'admin', timestamp: new Date().toISOString() });
  });

  // API routes (auth required)
  router.get('/api/system', requireAdminAuth, (req, res) => {
    const metrics = getSystemMetrics();
    const disk = getDiskUsage();
    res.json({ ...metrics, disk });
  });

  router.get('/api/services', requireAdminAuth, async (req, res) => {
    try {
      const services = await checkServices();
      res.json({ services });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/api/logs', requireAdminAuth, (req, res) => {
    const type = req.query.type || 'all';
    const limit = parseInt(req.query.limit) || 50;

    if (type === 'errors') {
      res.json({ logs: errorLogs.slice(0, limit) });
    } else if (type === 'requests') {
      res.json({ logs: requestLogs.slice(0, limit) });
    } else if (type === 'application') {
      res.json({ logs: applicationLogs.slice(0, limit) });
    } else {
      res.json({
        requests: requestLogs.slice(0, limit),
        errors: errorLogs.slice(0, limit),
        application: applicationLogs.slice(0, limit)
      });
    }
  });

  // Log streaming via SSE
  router.get('/api/logs/stream', requireAdminAuthSSE, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    // Send recent logs
    applicationLogs.slice(0, 20).reverse().forEach(log => {
      res.write(`data: ${JSON.stringify({ type: 'log', data: log })}\n\n`);
    });

    // Add client to broadcast list
    logStreamClients.add(res);

    // Keep-alive ping every 30 seconds
    const pingInterval = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);

    // Clean up on close
    req.on('close', () => {
      clearInterval(pingInterval);
      logStreamClients.delete(res);
    });
  });

  // Collections endpoint
  router.get('/api/collections', requireAdminAuth, async (req, res) => {
    try {
      const data = await getCollections(req.adminToken);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Analytics endpoint
  router.get('/api/analytics', requireAdminAuth, (req, res) => {
    const period = req.query.period || '1h';
    const analytics = getAnalytics(period);
    res.json(analytics);
  });

  // Environment info endpoint
  router.get('/api/environment', requireAdminAuth, async (req, res) => {
    const envInfo = getEnvironmentInfo();
    const pbStatus = await getPocketBaseVersion();
    res.json({ ...envInfo, pocketbase: { status: pbStatus, url: API_URL } });
  });

  // Backup endpoints
  router.get('/api/backups', requireAdminAuth, async (req, res) => {
    try {
      const backups = await listBackups(req.adminToken);
      res.json(backups);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/api/backups', requireAdminAuth, async (req, res) => {
    try {
      const result = await createBackup(req.adminToken, req.body?.name);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/api/backups/:key', requireAdminAuth, async (req, res) => {
    try {
      const result = await deleteBackup(req.adminToken, req.params.key);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/api/backups/:key/download', requireAdminAuth, async (req, res) => {
    // Redirect to PocketBase backup download
    const downloadUrl = `${API_URL}/api/backups/${encodeURIComponent(req.params.key)}`;
    res.redirect(downloadUrl);
  });

  // Static files
  router.use(express.static(path.join(__dirname, '../admin')));

  // SPA fallback
  router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
  });

  return router;
}

// Create standalone admin server
function createAdminServer() {
  const app = express();

  // Parse JSON bodies
  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logEntry = {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration
      };
      addLog(requestLogs, logEntry);
      addAnalyticsEntry({ ...logEntry, timestamp: Date.now() });
    });
    next();
  });

  // Error logging
  app.use((err, req, res, next) => {
    addLog(errorLogs, {
      message: err.message,
      stack: err.stack,
      path: req.path
    });
    captureLog('error', `${err.message} at ${req.path}`, 'express');
    next(err);
  });

  // Mount admin router at root
  app.use('/', createAdminRouter());

  return app;
}

function startAdminServer() {
  const app = createAdminServer();
  app.listen(ADMIN_PORT, () => {
    originalConsole.log(`Admin server listening on port ${ADMIN_PORT}`);
  });
  return app;
}

module.exports = {
  createAdminRouter,
  createAdminServer,
  startAdminServer,
  addLog,
  captureLog,
  requestLogs,
  errorLogs,
  applicationLogs
};
