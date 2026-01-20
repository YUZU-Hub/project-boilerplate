# Project: [PROJECT_NAME]

> **Note to Claude:** Update this file whenever you make significant changes to the project structure, deployment configuration, or technical decisions. Especially after initial setup, replace placeholder values and document any project-specific details.

## Overview

[Brief description of what this project does]

## Stack

- **Frontend:** Static HTML/CSS/JS (Homepage, Webapp, Admin Dashboard)
- **Backend:** Node.js Express + PocketBase
- **Deployment:** Docker (works anywhere: VPS, Coolify, Railway, Render, Fly.io)

## Directory Structure

```
├── homepage/         → Landing/marketing pages (static HTML/CSS/JS)
│   ├── css/
│   ├── js/
│   └── assets/images/
├── webapp/           → Web application (authenticated experience)
│   ├── css/
│   └── js/
├── admin/            → Admin dashboard (system monitoring)
│   ├── css/
│   ├── js/
│   └── components/
├── api/              → PocketBase configuration
│   ├── pb_hooks/     → Custom PocketBase hooks
│   └── pb_migrations/→ Database migrations
├── server/           → Node.js Express servers
├── Dockerfile        → Production container
├── Dockerfile.dev    → Development container
├── docker-compose.yml→ Local development
├── entrypoint.sh     → Production process manager
├── entrypoint.dev.sh → Development process manager
└── .github/workflows/→ CI/CD
```

## Architecture

Single Docker container running:
- **Homepage server (port 3000):** Static landing pages
- **Webapp server (port 3001):** Authenticated web application
- **Admin server (port 3002):** System monitoring dashboard
- **PocketBase (port 8090):** API and data admin UI

### Deployment Modes

**Mode 1: Separate ports (default)** - Best for subdomains
- `example.com` → port 3000 (homepage)
- `app.example.com` → port 3001 (webapp)
- `admin.example.com` → port 3002 (admin)
- `api.example.com` → port 8090 (PocketBase)

**Mode 2: Single port with paths** - Best for single domain
- Set `WEBAPP_PORT=` and `ADMIN_PORT=` (empty)
- `example.com/` → homepage
- `example.com/app/` → webapp
- `example.com/admin/` → admin dashboard

## Environment Variables

### MCP Server Credentials (once per machine)

These environment variables power Claude Code's MCP integrations. Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# REQUIRED for PocketBase MCP (database operations in Claude Code)
export POCKETBASE_ADMIN_EMAIL="admin@example.com"
export POCKETBASE_ADMIN_PASSWORD="your-password"

# REQUIRED for GitHub MCP (repo management in Claude Code)
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"  # https://github.com/settings/tokens

# OPTIONAL - Only if using Coolify for deployment
export COOLIFY_URL="https://coolify.your-server.com"
export COOLIFY_TOKEN="xxx"  # Coolify → Settings → API Tokens
```

After adding, run `source ~/.zshrc` or restart your terminal.

**Note:** Without these variables, you'll see warnings when Claude Code starts. The MCP servers that use them won't work until configured.

### Project Settings

Copy and configure:
```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `HOMEPAGE_PORT` | `3000` | Homepage server port |
| `WEBAPP_PORT` | `3001` | Webapp port (empty = mount on homepage) |
| `WEBAPP_PATH` | `/` | Webapp path when mounted |
| `ADMIN_PORT` | `3002` | Admin port (empty = mount on homepage) |
| `ADMIN_PATH` | `/admin` | Admin path when mounted |
| `API_URL` | `http://localhost:8090` | PocketBase URL |

## Claude Code Setup

### Documentation Lookup

**IMPORTANT:** Always use Context7 to check current documentation before implementing features:

```
"What's the current PocketBase JS SDK syntax for authentication?"
"How do I create a record with relations in PocketBase 0.25?"
```

### MCP Servers

All MCPs use environment variables for credentials. No secrets in `.mcp.json`.

| MCP Server | Purpose | Credentials From |
|------------|---------|------------------|
| `pocketbase` | Database operations | `POCKETBASE_*` env vars |
| `coolify` | Deployment management | `COOLIFY_*` env vars |
| `github` | Repo management | `GITHUB_*` env vars |
| `context7` | Documentation lookup | None needed |
| `fetch` | HTTP/API testing | None needed |
| `memory` | Persistent context | None needed |
| `docker` | Container management | None needed |

### Custom Commands

Available slash commands (in `.claude/commands/`):

- `/dev` - Start local development environment
- `/stop` - Stop all local servers
- `/db-status` - Check PocketBase health and collections
- `/setup` - Initial project configuration guide
- `/deploy` - Manual deployment instructions
- `/commit` - Create a commit with consistent message format
- `/migrate` - Guide for migrating existing projects

### Commit Message Convention

All projects use this format:

```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

See `/commit` command for full details.

### Permissions

Pre-configured permissions in `.claude/settings.json`:
- Docker compose operations
- npm and node commands
- Git operations
- curl for testing

## Local Development

### Quick Start

```bash
docker compose up --build
```

### Available Services

| Service | URL |
|---------|-----|
| Homepage | http://localhost:3000 |
| Web App | http://localhost:3001 |
| Admin Dashboard | http://localhost:3002 |
| PocketBase API | http://localhost:8090/api/ |
| PocketBase Admin | http://localhost:8090/_/ |

### Hot Reload

- **Static files:** Changes to `homepage/`, `webapp/`, `admin/` are immediate
- **Server code:** Changes to `server/*.js` auto-restart via Node.js `--watch`
- **PocketBase hooks:** Changes to `api/pb_hooks/` require container restart

## Deployment

### Coolify Setup

1. Create new application in Coolify
2. Connect to GitHub repository
3. Build path: `/` (root Dockerfile)
4. Configure domains for each port
5. Set environment variables

### Environment Variables (Coolify)

- `NODE_ENV=production`
- `API_URL=https://api.yourdomain.com`
- `HOMEPAGE_PORT=3000`
- `WEBAPP_PORT=3001` (or empty for path-based)
- `ADMIN_PORT=3002` (or empty for path-based)

### Auto-Deploy

Push to `main` branch triggers:
1. GitHub Actions builds and tests Docker image
2. Coolify detects changes and deploys

**IMPORTANT:** Always deploy using Dockerfile (not Nixpacks). Only Dockerfile deployments support rolling updates with zero downtime.

## Admin Dashboard

The admin dashboard provides operational insights:

| Feature | Description |
|---------|-------------|
| System Health | CPU, memory, uptime of container |
| Service Status | Health of all servers |
| Request Logs | Recent HTTP requests |
| PocketBase Stats | Database size, health status |

**Authentication:** Requires PocketBase admin credentials.

## PocketBase Notes

### Hooks

Custom hooks in `api/pb_hooks/main.pb.js`:
- Custom routes
- Database event handlers
- Cron jobs

**Note:** Hooks run in isolated contexts - variables declared outside handlers aren't accessible inside them.

### Migrations

Migrations stored in `api/pb_migrations/`. Export from admin UI or create manually.

### Reserved System Routes

**NEVER overwrite these routes with custom hooks** - they are used by PocketBase internally:

| Route | Purpose |
|-------|---------|
| `/_/*` | Admin dashboard UI |
| `/api/health` | Health check endpoint |
| `/api/settings` | Application settings |
| `/api/backups/*` | Backup management |
| `/api/collections/*` | Collection schema CRUD |
| `/api/collections/{c}/records/*` | Record CRUD operations |
| `/api/collections/{c}/auth-methods` | List auth methods |
| `/api/collections/{c}/auth-with-password` | Password authentication |
| `/api/collections/{c}/auth-with-oauth2` | OAuth2 authentication |
| `/api/collections/{c}/auth-with-otp` | OTP authentication |
| `/api/collections/{c}/auth-refresh` | Refresh auth token |
| `/api/collections/{c}/request-verification` | Request email verification |
| `/api/collections/{c}/confirm-verification` | Confirm email verification |
| `/api/collections/{c}/request-password-reset` | Request password reset |
| `/api/collections/{c}/confirm-password-reset` | Confirm password reset |
| `/api/collections/{c}/request-email-change` | Request email change |
| `/api/collections/{c}/confirm-email-change` | Confirm email change |
| `/api/collections/{c}/impersonate` | Impersonate user (superuser) |
| `/api/files/*` | File serving |
| `/api/realtime` | SSE realtime subscriptions |
| `/api/batch` | Batch API requests |

**Safe pattern for custom routes:** Use `/api/custom/` or `/api/myapp/` prefix.

## Notes

Only use PocketBase Authentication. Don't implement Auth yourself.

[Add any project-specific notes, decisions, or gotchas here]

---

**Last updated:** [DATE]
**Updated by:** [Claude/Human]
