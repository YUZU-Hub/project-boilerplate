# Initial Project Setup

Run this after cloning the boilerplate to configure a new project.

## 1. Start the Development Environment

```bash
cp .env.example .env
docker compose up --build
```

Visit http://localhost:8090/_/ to create your PocketBase admin account.

## 2. Set Up MCP Credentials

Add to `~/.zshrc` (required for Claude Code MCP integrations):

```bash
# PocketBase MCP - use the credentials you just created
export POCKETBASE_ADMIN_EMAIL="admin@example.com"
export POCKETBASE_ADMIN_PASSWORD="your-password"

# GitHub MCP - create at https://github.com/settings/tokens
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"
```

Then reload: `source ~/.zshrc`

## 3. Update Project Name

Replace placeholders in:
- `CLAUDE.md` - Update [PROJECT_NAME] and description
- `README.md` - Update project name
- `homepage/index.html` - Update title and content
- `LICENSE` - Update year and author

## 4. Verify Everything Works

Services should be available at:
- Homepage: http://localhost:3000
- Web App: http://localhost:3001
- Admin: http://localhost:3002
- PocketBase Admin: http://localhost:8090/_/
