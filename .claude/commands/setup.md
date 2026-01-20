# Initial Project Setup

Run this after cloning the boilerplate to configure a new project.

## 1. Fix MCP Server Warnings

If you see warnings like "Missing environment variables" when Claude Code starts, add these to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# REQUIRED - For PocketBase MCP (database operations)
export POCKETBASE_ADMIN_EMAIL="admin@example.com"
export POCKETBASE_ADMIN_PASSWORD="your-password"

# REQUIRED - For GitHub MCP (repo management)
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"  # https://github.com/settings/tokens

# OPTIONAL - Only if using Coolify for deployment
export COOLIFY_URL="https://coolify.your-server.com"
export COOLIFY_TOKEN="xxx"
```

Then reload: `source ~/.zshrc`

**Note:** PocketBase credentials are created when you first access http://localhost:8090/_/ after starting the dev server.

## 2. Update Project Name

Replace placeholders in key files:
- `CLAUDE.md` - Update [PROJECT_NAME] and all placeholder values
- `README.md` - Update project name and description
- `homepage/index.html` - Update title and content
- `LICENSE` - Update year and author name

## 3. Configure Project Environment

```bash
cp .env.example .env
```

Edit with project-specific values if needed.

## 4. Test Locally

```bash
docker compose up --build
```

Visit:
- Homepage: http://localhost:3000
- Web App: http://localhost:3001
- Admin: http://localhost:3002
- PocketBase Admin: http://localhost:8090/_/

## 5. Deploy

### Option A: Any Docker Host

```bash
docker build -t myapp .
docker run -d -p 3000:3000 -p 3001:3001 -p 3002:3002 -p 8090:8090 myapp
```

### Option B: PaaS Platform (Coolify, Railway, Render, Fly.io)

1. Connect your GitHub repository
2. Point to the root `Dockerfile`
3. Configure environment variables:
   - `NODE_ENV=production`
   - `API_URL=https://api.yourdomain.com`
4. Configure domains for each port:
   - Port 3000 → yourdomain.com (homepage)
   - Port 3001 → app.yourdomain.com (webapp)
   - Port 3002 → admin.yourdomain.com (admin)
   - Port 8090 → api.yourdomain.com (PocketBase)
