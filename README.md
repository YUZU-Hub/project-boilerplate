# Vibe Coding Boilerplate

A boilerplate optimized for **vibe coding** with Claude Code. Pre-configured MCP servers, slash commands, and a clean architecture that AI understands. Just describe what you want to build.

## Why This Exists

Vibe coding works best when the AI understands your project structure. This boilerplate provides:

- **MCP Servers** - Claude Code can directly interact with your database, GitHub, and deployment
- **Slash Commands** - `/dev`, `/stop`, `/deploy`, `/commit` work out of the box
- **Clean Architecture** - Separation that AI can reason about easily
- **CLAUDE.md** - Project context that helps Claude understand your codebase

## Quick Start

### 1. Clone and Start

```bash
git clone https://github.com/your-org/your-project.git
cd your-project
docker compose up --build
```

Services will be available at:
- Homepage: http://localhost:3000
- Web App: http://localhost:3001
- Admin Dashboard: http://localhost:3002
- PocketBase API: http://localhost:8090
- PocketBase Admin: http://localhost:8090/_/

### 2. Set Up MCP Credentials

For Claude Code to interact with your services, add to `~/.zshrc`:

```bash
# Required for PocketBase MCP (database operations)
export POCKETBASE_ADMIN_EMAIL="admin@example.com"
export POCKETBASE_ADMIN_PASSWORD="xxx"

# Required for GitHub MCP (repo management)
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"

# Optional - only if using Coolify for deployment
export COOLIFY_URL="https://coolify.your-server.com"
export COOLIFY_TOKEN="xxx"
```

Then run `source ~/.zshrc`.

### 3. Start Vibe Coding

Open the project in Claude Code and try:

```
"Add a user registration form to the webapp"
"Create a PocketBase collection for blog posts"
"Deploy this to production"
```

Or use slash commands:
- `/dev` - Start development environment
- `/stop` - Stop all services
- `/db-status` - Check PocketBase health
- `/deploy` - Deployment guide
- `/commit` - Create a formatted commit

## Architecture

Single Docker container running:
- **Node.js Express** - Homepage (3000), Webapp (3001), Admin (3002)
- **PocketBase** - API and database (8090)

```
project/
├── homepage/     → Landing pages (static)
├── webapp/       → Web application
├── admin/        → Admin dashboard
├── server/       → Node.js Express servers
├── api/          → PocketBase hooks & migrations
└── .claude/      → Claude Code configuration
```

## Deployment

Deploy anywhere Docker runs:

```bash
docker build -t myapp .
docker run -p 3000:3000 -p 3001:3001 -p 3002:3002 -p 8090:8090 myapp
```

Works with Coolify, Railway, Render, Fly.io, DigitalOcean, or any Docker host.

## Stack

- **AI:** Claude Code with MCP servers
- **Frontend:** Static HTML/CSS/JS
- **Backend:** Node.js Express + PocketBase
- **Deployment:** Docker (any platform)

See [CLAUDE.md](CLAUDE.md) for full documentation.
