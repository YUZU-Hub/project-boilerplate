# Project Name

[Brief description]

## Quick Start

### 1. Set Up Shared Credentials (once per machine)

Add to `~/.zshrc` or `~/.bashrc` (see `.env.shared.example`):

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"
export COOLIFY_URL="https://coolify.your-server.com"
export COOLIFY_TOKEN="xxx"
export POCKETBASE_ADMIN_EMAIL="admin@example.com"
export POCKETBASE_ADMIN_PASSWORD="xxx"
```

### 2. Start Development

```bash
docker compose up --build
```

Available services:
- Homepage: http://localhost:3000
- Web App: http://localhost:3001
- Admin Dashboard: http://localhost:3002
- PocketBase API: http://localhost:8090
- PocketBase Admin: http://localhost:8090/_/

## Claude Code Integration

This boilerplate includes Claude Code configuration:

- **MCP Servers:** PocketBase, Coolify, Context7, GitHub, Fetch, Memory, Docker
- **Custom Commands:** `/dev`, `/stop`, `/db-status`, `/setup`, `/deploy`, `/migrate`, `/commit`
- **Environment:** Two-tier system - shared credentials in shell profile, project settings in `.env`

Run `/setup` in Claude Code after cloning to configure your project.

## Architecture

Single Docker container running:
- **Node.js Express** - Homepage (3000), Webapp (3001), Admin (3002)
- **PocketBase** - API and database (8090)

## Deployment

Auto-deploys to Coolify via root Dockerfile when changes are pushed to `main`.

See [CLAUDE.md](CLAUDE.md) for full documentation.

## Stack

- **Frontend:** Static HTML/CSS/JS
- **Backend:** Node.js Express + PocketBase
- **Deployment:** Coolify (Docker)
- **CI/CD:** GitHub Actions
