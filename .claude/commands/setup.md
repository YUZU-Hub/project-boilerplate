# Initial Project Setup

Run this after cloning the boilerplate to configure a new project.

## 1. One-Time Setup (if not already done)

Add shared credentials to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# Copy from .env.shared.example and fill in your values
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"
export COOLIFY_URL="https://coolify.your-server.com"
export COOLIFY_TOKEN="xxx"
export POCKETBASE_ADMIN_EMAIL="admin@example.com"
export POCKETBASE_ADMIN_PASSWORD="xxx"
```

Then reload: `source ~/.zshrc`

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

## 4. Configure Coolify

1. Create new application in Coolify
2. Connect to this GitHub repository
3. Set build path to root `/` (uses root Dockerfile)
4. Configure environment variables:
   - `NODE_ENV=production`
   - `API_URL=https://api.yourdomain.com`
5. Configure domains for each port:
   - Port 3000 → yourdomain.com (homepage)
   - Port 3001 → app.yourdomain.com (webapp)
   - Port 3002 → admin.yourdomain.com (admin)
   - Port 8090 → api.yourdomain.com (PocketBase)

## 5. Test Locally

```bash
docker compose up --build
```

Visit:
- Homepage: http://localhost:3000
- Web App: http://localhost:3001
- Admin: http://localhost:3002
- PocketBase Admin: http://localhost:8090/_/
