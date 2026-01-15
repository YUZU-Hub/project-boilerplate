# Initial Project Setup

Run this after cloning the boilerplate to configure a new project.

## 1. One-Time Setup (if not already done)

Add shared credentials to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# Copy from .env.shared.example and fill in your values
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxx"
export COOLIFY_URL="https://coolify.your-server.com"
export COOLIFY_TOKEN="xxx"
export SHARED_HOST_SSH_HOST="www453.your-server.de"
export SHARED_HOST_SSH_PORT="222"
export SHARED_HOST_SSH_USER="username"
export POCKETBASE_ADMIN_EMAIL="admin@example.com"
export POCKETBASE_ADMIN_PASSWORD="xxx"
```

Then reload: `source ~/.zshrc`

## 2. Update Project Name

Replace placeholders in key files:
- `CLAUDE.md` - Update [PROJECT_NAME] and all placeholder values
- `README.md` - Update project name and description
- `web/index.php` - Update title
- `LICENSE` - Update year and author name

## 3. Configure Project Environment

```bash
cp web/.env.example web/.env
cp api/.env.example api/.env
```

Edit with project-specific values:
- `API_URL` - Your production API URL
- `SFTP_ROOT_PATH` - Your deploy path on shared hosting

## 4. Configure GitHub Secrets

In your GitHub repository settings, add:

**Secrets:**
- `SSH_PRIVATE_KEY` - Your SSH private key for deployment

**Variables:**
- `SSH_HOST` - Your server hostname
- `SSH_PORT` - SSH port (usually 22 or 222)
- `SSH_USER` - SSH username
- `DEPLOY_PATH` - Absolute path to web directory on server
- `BACKUP_PATH` - Absolute path to backup directory on server

## 5. Configure Coolify

1. Create new application in Coolify
2. Connect to this GitHub repository
3. Set build path to `/api`
4. Environment variables are inherited from your shell

## 6. Test Locally

```bash
cd api && docker compose up -d
cd web && php -S localhost:8000
```

Visit http://localhost:8000 to verify setup.
