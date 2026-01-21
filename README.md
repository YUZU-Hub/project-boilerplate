# Vibe Coding Boilerplate

A boilerplate optimized for **vibe coding** with Claude Code. Pre-configured MCP servers, slash commands, and a clean architecture that AI understands.

## Quick Start

**One-liner:**
```bash
curl -fsSL https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/install.sh | sh -s myproject
```

**Or manually:**
```bash
git clone https://github.com/YUZU-Hub/project-boilerplate.git myproject
cd myproject
cp .env.example .env
docker compose up --build -d
```

Your app is running at:
- **Homepage:** http://localhost:3000
- **Web App:** http://localhost:3001
- **Admin:** http://localhost:3002
- **PocketBase Admin:** http://localhost:8090/_/

## Setup (Required)

**1. Create PocketBase admin account:**

Open http://localhost:8090/_/ and create your admin user.

**2. Configure MCP credentials** (add to `~/.zshrc`):

```bash
# PocketBase MCP (required for Claude to manage your database)
export POCKETBASE_ADMIN_EMAIL="your-email@example.com"
export POCKETBASE_ADMIN_PASSWORD="your-password"

# GitHub MCP (optional, for repo management)
# Create at: https://github.com/settings/tokens (scopes: repo, read:org)
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"
```

Then reload: `source ~/.zshrc`

**3. Start building:**

```bash
cd myproject
claude "Build a todo list app with user authentication and sharing between users"
```

Changes hot-reload automatically.

## Slash Commands

- `/dev` - Start development environment
- `/stop` - Stop all services
- `/db-status` - Check PocketBase health
- `/setup` - Initial project configuration
- `/deploy` - Deployment guide
- `/commit` - Create a formatted commit

## Architecture

Single Docker container running:
- **Node.js Express** - Homepage (3000), Webapp (3001), Admin (3002)
- **PocketBase** - API and database (8090)

```
project/
├── homepage/     → Landing pages (static HTML/CSS/JS)
├── webapp/       → Web application
├── admin/        → Admin dashboard
├── server/       → Node.js Express servers
├── api/          → PocketBase hooks & migrations
└── .claude/      → Claude Code configuration
```

### Deployment Modes

**Mode 1: Separate ports (default)** - Best for subdomains
```
example.com       → port 3000 (homepage)
app.example.com   → port 3001 (webapp)
admin.example.com → port 3002 (admin)
api.example.com   → port 8090 (PocketBase)
```

**Mode 2: Single port with paths** - Best for single domain
Set `WEBAPP_PORT=` and `ADMIN_PORT=` to empty in `.env`:
```
example.com/       → homepage
example.com/app/   → webapp
example.com/admin/ → admin dashboard
```

## Deployment

Deploy anywhere Docker runs:

```bash
# Build production image
docker build -t myapp .

# Run (any Docker host)
docker run -d --restart unless-stopped \
  -p 3000:3000 -p 3001:3001 -p 3002:3002 -p 8090:8090 \
  -v pb_data:/app/api/pb_data \
  -e NODE_ENV=production \
  myapp
```

Works with Coolify, Railway, Render, Fly.io, DigitalOcean, or any Docker host.

### Production Environment Variables

```bash
NODE_ENV=production
API_URL=https://api.yourdomain.com
HOMEPAGE_PORT=3000
WEBAPP_PORT=3001   # or empty for path-based
ADMIN_PORT=3002    # or empty for path-based
```

## Stack

- **AI:** Claude Code with MCP servers
- **Frontend:** Static HTML/CSS/JS
- **Backend:** Node.js Express + PocketBase
- **Deployment:** Docker (any platform)

See [CLAUDE.md](CLAUDE.md) for AI-specific instructions.
