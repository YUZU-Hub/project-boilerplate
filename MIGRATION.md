# Migration Guide

Use this guide to incrementally adopt the boilerplate structure in existing projects. Copy this file to your project and check off items as you migrate them.

## Prerequisites

Before migrating any project, ensure shared credentials are in your shell profile:

```bash
# Check if already set up
echo $GITHUB_PERSONAL_ACCESS_TOKEN
echo $COOLIFY_URL
```

If not set, see `.env.shared.example` from the boilerplate and add exports to `~/.zshrc`.

---

## Migration Checklist

### Phase 1: Foundation (No Risk)

These are additive changes that won't break anything.

- [ ] **CLAUDE.md** - Copy and customize for your project
  ```bash
  curl -o CLAUDE.md https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/CLAUDE.md
  ```

- [ ] **.editorconfig** - Consistent formatting
  ```bash
  curl -o .editorconfig https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/.editorconfig
  ```

- [ ] **LICENSE** - If missing
  ```bash
  curl -o LICENSE https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/LICENSE
  ```

### Phase 2: Claude Code Integration (No Risk)

- [ ] **.claude/** directory - Commands, agents, and settings
  ```bash
  mkdir -p .claude/commands .claude/agents
  curl -o .claude/settings.json https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/.claude/settings.json
  curl -o .claude/commands/dev.md https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/.claude/commands/dev.md
  curl -o .claude/commands/stop.md https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/.claude/commands/stop.md
  curl -o .claude/commands/db-status.md https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/.claude/commands/db-status.md
  curl -o .claude/commands/deploy.md https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/.claude/commands/deploy.md
  curl -o .claude/commands/commit.md https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/.claude/commands/commit.md
  curl -o .claude/commands/migrate.md https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/.claude/commands/migrate.md
  curl -o .claude/agents/commit.md https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/.claude/agents/commit.md
  ```
  Then customize commands for your project's paths/ports.

  The `/commit` command ensures consistent commit messages across all projects:
  ```
  <type>(<scope>): <subject>
  ```
  Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

- [ ] **.mcp.json** - MCP server configuration
  ```bash
  curl -o .mcp.json https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/.mcp.json
  ```
  Uses env vars, safe to commit. Adjust `SFTP_ROOT_PATH` default if needed.

### Phase 3: Git Hygiene (Low Risk)

- [ ] **Update .gitignore** - Merge with boilerplate version
  ```bash
  # Review and merge manually - don't overwrite!
  curl -o .gitignore.new https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/.gitignore
  # Compare and merge:
  diff .gitignore .gitignore.new
  ```

- [ ] **Add web/.gitignore** - If you have a web directory
  ```bash
  curl -o web/.gitignore https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/web/.gitignore
  ```

- [ ] **Add api/.gitignore** - If you have an api directory
  ```bash
  curl -o api/.gitignore https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/api/.gitignore
  ```

### Phase 4: Environment Variables (Medium Risk)

Requires updating how you handle credentials.

- [ ] **Create .env.example files** - Document required variables
  - `web/.env.example` - Project-specific web config
  - `api/.env.example` - Project-specific API config

- [ ] **Update existing .env files** - Remove shared credentials, keep project-specific
  - Before: `COOLIFY_TOKEN=xxx` (shared)
  - After: References `$COOLIFY_TOKEN` from shell

- [ ] **Test that env vars are picked up** - Restart terminal, verify MCPs work

### Phase 5: API Structure (Medium Risk)

Only if using PocketBase.

- [ ] **api/Dockerfile** - Standardized PocketBase container
- [ ] **api/docker-compose.yml** - Local development setup
- [ ] **api/nixpacks.toml** - Coolify deployment config
- [ ] **api/pb_hooks/main.pb.js** - Hooks template (merge with existing)
- [ ] **api/pb_migrations/** - Keep your existing migrations!

### Phase 6: Web Structure (Medium Risk)

- [ ] **web/js/api-client.js** - Reusable PocketBase client (optional)
- [ ] **web/index.php** - Only if starting fresh or want the template

### Phase 7: CI/CD (Higher Risk)

Test in a branch first!

- [ ] **.github/workflows/deploy-web.yml** - Web deployment
  - Review and adapt paths, SSH settings
  - Test with a non-production branch first
  - Ensure GitHub Secrets/Variables are configured

- [ ] **.github/workflows/deploy-api.yml** - API deployment notifications
  - Only adds manual trigger, low risk

---

## Quick Reference: What Goes Where

| Credential | Location | Scope |
|------------|----------|-------|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | `~/.zshrc` | All projects |
| `COOLIFY_URL`, `COOLIFY_TOKEN` | `~/.zshrc` | All projects |
| `SHARED_HOST_SSH_*` | `~/.zshrc` | All projects |
| `POCKETBASE_ADMIN_*` | `~/.zshrc` | All projects |
| `API_URL` | `web/.env` | This project |
| `SFTP_ROOT_PATH` | `web/.env` | This project |
| `DEPLOY_PATH`, `BACKUP_PATH` | GitHub Variables | This repo |
| `SSH_PRIVATE_KEY` | GitHub Secrets | This repo |

---

## Rollback

If something breaks:

1. **MCP issues**: Delete `.mcp.json`, MCPs will just be unavailable
2. **Command issues**: Delete `.claude/commands/`, commands will be unavailable
3. **Workflow issues**: Revert via git, workflows only run on push to main
4. **Env var issues**: Add credentials back to project `.env` files temporarily

---

## After Migration

- [ ] Delete this `MIGRATION.md` file
- [ ] Update `CLAUDE.md` with project-specific details
- [ ] Commit changes: `git add -A && git commit -m "Adopt project boilerplate structure"`
