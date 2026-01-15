# Migrate Existing Project

Help migrate an existing project to the boilerplate structure.

## Check Current State

First, let's see what's already in place:

```bash
ls -la CLAUDE.md .editorconfig LICENSE .mcp.json 2>/dev/null || echo "Missing foundation files"
ls -la .claude/ 2>/dev/null || echo "No .claude directory"
ls -la .github/workflows/ 2>/dev/null || echo "No workflows"
```

## Check Shared Credentials

```bash
[ -n "$GITHUB_PERSONAL_ACCESS_TOKEN" ] && echo "✓ GitHub token" || echo "✗ GitHub token missing"
[ -n "$COOLIFY_URL" ] && echo "✓ Coolify URL" || echo "✗ Coolify URL missing"
[ -n "$COOLIFY_TOKEN" ] && echo "✓ Coolify token" || echo "✗ Coolify token missing"
[ -n "$SHARED_HOST_SSH_HOST" ] && echo "✓ SSH host" || echo "✗ SSH host missing"
[ -n "$SHARED_HOST_SSH_USER" ] && echo "✓ SSH user" || echo "✗ SSH user missing"
[ -n "$POCKETBASE_ADMIN_EMAIL" ] && echo "✓ PocketBase email" || echo "✗ PocketBase email missing"
```

If any show ✗, set them up in `~/.zshrc` first (see `.env.shared.example` in boilerplate).

## Migration Phases

Tell me which phase you want to work on:

1. **Foundation** - CLAUDE.md, .editorconfig, LICENSE
2. **Claude Code** - .claude/ directory, .mcp.json
3. **Git Hygiene** - .gitignore updates
4. **Environment** - Convert to two-tier env vars
5. **API Structure** - Dockerfile, docker-compose, nixpacks
6. **Web Structure** - api-client.js, index.php template
7. **CI/CD** - GitHub Actions workflows

See `MIGRATION.md` for detailed checklist.
