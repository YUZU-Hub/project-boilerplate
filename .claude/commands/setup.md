# Initial Project Setup

Run this after cloning the boilerplate to configure a new project.

## 1. Start the Development Environment

**Recommended:** Use the install script which handles everything:

```bash
curl -fsSL https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/install.sh | sh -s myproject
```

This will:
- Clone the repo
- Prompt for admin email/password
- Create the PocketBase superuser
- Optionally add MCP credentials to `~/.zshrc`
- Start the development environment

**Manual alternative:**

```bash
cp .env.example .env
docker compose up --build
# Then visit http://localhost:8090/_/ to create admin account manually
```

## 2. Set Up MCP Credentials (if not done by install script)

Add to `~/.zshrc` (required for Claude Code MCP integrations):

```bash
# PocketBase MCP
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
