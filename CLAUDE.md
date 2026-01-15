# Project: [PROJECT_NAME]

> **Note to Claude:** Update this file whenever you make significant changes to the project structure, deployment configuration, or technical decisions. Especially after initial setup, replace placeholder values and document any project-specific details.

## Overview

[Brief description of what this project does]

## Stack

- **Web:** PHP/HTML (shared hosting)
- **API:** PocketBase (self-hosted on Coolify)
- **Mobile:** [iOS / Android / React Native] (if applicable)

## Directory Structure

```
├── web/              → Static/PHP site, deployed to shared hosting
├── api/              → PocketBase backend, deployed via Coolify
├── mobile/           → Mobile app source code
├── .github/          → GitHub Actions for deployment
└── .claude/          → Claude Code configuration
    ├── settings.json → Permissions and hooks
    └── commands/     → Custom slash commands
```

## Environment Variables

This project uses a two-tier environment variable system:

### Shared Credentials (once per machine)

Credentials used across ALL projects. Add these to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# See .env.shared.example for full list
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"
export COOLIFY_URL="https://coolify.your-server.com"
export COOLIFY_TOKEN="xxx"
export SHARED_HOST_SSH_HOST="www453.your-server.de"
export SHARED_HOST_SSH_PORT="222"
export SHARED_HOST_SSH_USER="username"
export SHARED_HOST_SSH_KEY="~/.ssh/id_rsa"
export POCKETBASE_ADMIN_EMAIL="admin@example.com"
export POCKETBASE_ADMIN_PASSWORD="xxx"
```

After adding, run `source ~/.zshrc` or restart your terminal.

### Project-Specific Settings (per project)

Settings unique to this project. Copy and configure:

```bash
cp web/.env.example web/.env
cp api/.env.example api/.env
```

Project-specific variables:
- `API_URL` - Production API URL for this project
- `SFTP_ROOT_PATH` - Deploy path for this project (overrides shared default)

## Claude Code Setup

### Documentation Lookup

**IMPORTANT:** Always use Context7 to check current documentation before implementing features, especially for:

- **PocketBase** - API changed significantly between versions (v0.22+ has breaking changes)
- **Any SDK or library** - Don't rely on training data, fetch current docs
- **Deployment configs** - Coolify, Nixpacks, Docker configurations evolve

Use the `context7` MCP to query docs:
```
"What's the current PocketBase JS SDK syntax for authentication?"
"How do I create a record with relations in PocketBase 0.22?"
```

### MCP Servers

All MCPs use environment variables for credentials. No secrets in `.mcp.json`.

| MCP Server | Purpose | Credentials From |
|------------|---------|------------------|
| `pocketbase` | Database operations | `POCKETBASE_*` env vars |
| `coolify` | Deployment management | `COOLIFY_*` env vars |
| `ssh` | Server commands | `SHARED_HOST_*` env vars |
| `sftp` | File transfer | `SHARED_HOST_*` env vars |
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
- Local PHP server
- Git operations
- npm scripts

## Deployment

### Web (Shared Hosting)

- **Host:** [e.g., Strato]
- **URL:** https://[domain.com]
- **Deploy:** Automatic via GitHub Actions on push to `main` (only when `web/` changes)
- **Path on server:** [e.g., `/usr/home/xxx/public_html/domain.com/`]
- **Backups:** Automatic, 7-day retention

### API (PocketBase)

- **Host:** Coolify on [server]
- **URL:** https://api.[domain.com]
- **Deploy:** Automatic via Coolify on push to `main` (only when `api/` changes)
- **Admin UI:** https://api.[domain.com]/_/
- **Config:** `api/nixpacks.toml` for Coolify settings

## Local Development

### Quick Start

```bash
# Start everything (use /dev command in Claude Code)
cd api && docker compose up -d
cd web && php -S localhost:8000
```

### API

```bash
cd api
docker compose up --build
```

- Admin UI: http://localhost:8090/_/
- API: http://localhost:8090/api/
- Health: http://localhost:8090/api/health

### Web

```bash
cd web
cp .env.example .env  # Configure API_URL
php -S localhost:8000
```

- Site: http://localhost:8000

## GitHub Secrets & Variables

### Secrets (required)

- `SSH_PRIVATE_KEY` - SSH key for shared hosting deployment

### Variables (required)

- `SSH_HOST` - [e.g., www453.your-server.de]
- `SSH_PORT` - [e.g., 222]
- `SSH_USER` - [e.g., username]
- `DEPLOY_PATH` - [e.g., /usr/home/xxx/public_html/domain.com/]
- `BACKUP_PATH` - [e.g., /usr/home/xxx/backups/domain.com]

## PocketBase Notes

### Hooks

Custom hooks in `api/pb_hooks/main.pb.js`:
- Custom routes
- Database event handlers
- Cron jobs

### Migrations

Migrations stored in `api/pb_migrations/`. Export from admin UI or create manually.

## Notes

PocketBase hooks run in isolated contexts - variables declared outside handlers aren't accessible inside them.

[Add any project-specific notes, decisions, or gotchas here]

---

**Last updated:** [DATE]
**Updated by:** [Claude/Human]
