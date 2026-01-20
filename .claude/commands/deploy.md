# Manual Deployment

This project deploys to Coolify automatically when changes are pushed to `main`.

## Check Deployment Status

### GitHub Actions
```bash
gh run list --workflow=deploy.yml --limit=5
```

### Coolify
Check your Coolify dashboard for deployment status and logs.

## Trigger Manual Deployment

### Via GitHub Actions
```bash
gh workflow run deploy.yml
```

### Via Coolify
Use the Coolify MCP or dashboard to manually redeploy.

## Deployment Architecture

All services run in a single Docker container:

| Service | Port | Domain Example |
|---------|------|----------------|
| Homepage | 3000 | example.com |
| Web App | 3001 | app.example.com |
| Admin Dashboard | 3002 | admin.example.com |
| PocketBase | 8090 | api.example.com |

Configure domains and SSL in Coolify.

## Environment Variables

Set these in Coolify:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `API_URL` | Your production PocketBase URL |
| `HOMEPAGE_PORT` | `3000` (default) |
| `WEBAPP_PORT` | `3001` or empty for path-based |
| `ADMIN_PORT` | `3002` or empty for path-based |
