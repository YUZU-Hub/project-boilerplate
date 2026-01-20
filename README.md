# Project Name

[Brief description]

## Quick Start

### 1. Start Development

```bash
docker compose up --build
```

Available services:
- Homepage: http://localhost:3000
- Web App: http://localhost:3001
- Admin Dashboard: http://localhost:3002
- PocketBase API: http://localhost:8090
- PocketBase Admin: http://localhost:8090/_/

### 2. Set Up MCP Credentials (for Claude Code)

If you see "Missing environment variables" warnings in Claude Code, add these to `~/.zshrc`:

```bash
# Required for PocketBase MCP
export POCKETBASE_ADMIN_EMAIL="admin@example.com"
export POCKETBASE_ADMIN_PASSWORD="xxx"

# Required for GitHub MCP
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"

# Optional - only if using Coolify
export COOLIFY_URL="https://coolify.your-server.com"
export COOLIFY_TOKEN="xxx"
```

Then run `source ~/.zshrc`. See `.env.shared.example` for details.

## Claude Code Integration

This boilerplate includes Claude Code configuration:

- **MCP Servers:** PocketBase, GitHub, Context7, Fetch, Memory, Docker, Coolify (optional)
- **Custom Commands:** `/dev`, `/stop`, `/db-status`, `/setup`, `/deploy`, `/migrate`, `/commit`

Run `/setup` in Claude Code after cloning to configure your project.

## Architecture

Single Docker container running:
- **Node.js Express** - Homepage (3000), Webapp (3001), Admin (3002)
- **PocketBase** - API and database (8090)

## Deployment

Deploy anywhere Docker runs:

```bash
docker build -t myapp .
docker run -p 3000:3000 -p 3001:3001 -p 3002:3002 -p 8090:8090 myapp
```

Works with any Docker host, Coolify, Railway, Render, Fly.io, etc.

See [CLAUDE.md](CLAUDE.md) for full documentation.

## Stack

- **Frontend:** Static HTML/CSS/JS
- **Backend:** Node.js Express + PocketBase
- **Deployment:** Docker (any host)
- **CI/CD:** GitHub Actions
