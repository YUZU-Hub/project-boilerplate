# Project Name

[Brief description]

## Quick Start

### 1. Set Up Shared Credentials (once per machine)

Add to `~/.zshrc` or `~/.bashrc` (see `.env.shared.example`):

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"
export COOLIFY_URL="https://coolify.your-server.com"
export COOLIFY_TOKEN="xxx"
# ... see .env.shared.example for full list
```

### 2. Start Development

```bash
# API (PocketBase)
cd api && docker compose up --build

# Web (in another terminal)
cd web && cp .env.example .env && php -S localhost:8000
```

- Admin UI: http://localhost:8090/_/
- Web: http://localhost:8000

## Claude Code Integration

This boilerplate includes Claude Code configuration:

- **MCP Servers:** PocketBase, Coolify, SSH, SFTP, Context7, GitHub, Fetch, Memory, Docker
- **Custom Commands:** `/dev`, `/stop`, `/db-status`, `/setup`, `/deploy`, `/migrate`, `/commit`
- **Environment:** Two-tier system - shared credentials in shell profile, project settings in `.env` files

Run `/setup` in Claude Code after cloning to configure your project.

## Deployment

- **Web:** Auto-deploys to shared hosting via GitHub Actions
- **API:** Auto-deploys to Coolify via Dockerfile (required for rolling updates)

See [CLAUDE.md](CLAUDE.md) for full documentation.

## Stack

- **Web:** PHP/HTML on shared hosting
- **API:** PocketBase on Coolify
- **CI/CD:** GitHub Actions
