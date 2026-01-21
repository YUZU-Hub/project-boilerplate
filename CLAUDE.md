# Project: [PROJECT_NAME]

> **CRITICAL - READ FIRST:**
> - **NEVER run `pocketbase superuser` commands.** The admin account is created by the user during install. If PocketBase shows "create superuser", tell the user to run the install script or create the account manually via `http://localhost:8090/_/`.
> - **NEVER create admin credentials.** Use the existing `POCKETBASE_ADMIN_TOKEN` from environment variables.

> **Welcome Message:** If this file still contains `[PROJECT_NAME]` as the title, this is a fresh clone of the boilerplate. Greet the user warmly, explain this is a vibe coding boilerplate optimized for Claude Code, and offer to run `/setup` to configure their project. Keep it brief and friendly.

## Overview

[Brief description of what this project does]

## Directory Structure

```
├── homepage/         → Landing/marketing pages (static HTML/CSS/JS)
├── webapp/           → Web application (authenticated experience)
├── admin/            → Admin dashboard (system monitoring)
├── api/              → PocketBase configuration
│   ├── pb_hooks/     → Custom PocketBase hooks
│   └── pb_migrations/→ Database migrations
├── server/
│   └── index.js      → Single unified Express server (all 3 apps)
├── Dockerfile        → Unified container (dev + prod)
├── docker-compose.yml→ Local development
├── entrypoint.sh     → Process manager (dev + prod)
└── .claude/          → Claude Code configuration
```

## Architecture

Single Node.js process running multiple Express apps on different ports. Memory-efficient design sharing V8 engine and runtime.

## Quick Start After Clone

```bash
# 1. Install and start (creates admin account automatically)
curl -fsSL https://raw.githubusercontent.com/YUZU-Hub/project-boilerplate/main/install.sh | sh -s myproject

# 2. Create the todos collection to activate the example app
cd myproject
claude "Create a todos collection with title, completed, and user fields"

# 3. Visit http://localhost:3001 - register, login, and the todo app works!
```

**What ships vs. what you create:**
- **Ships:** Auth UI, example CRUD code in `webapp/js/app.js`, CSS styles
- **You create:** The `todos` collection (via MCP or migration) - it is NOT created automatically
- The example code shows "Getting Started" instructions until the collection exists

## Development Workflow

**When building features:**
1. Create PocketBase collections via MCP (requires docker running)
2. Add frontend code to `webapp/` (hot-reloads)
3. Add hooks to `api/pb_hooks/` if needed (requires restart)
4. Test at http://localhost:3001

**Important:** Docker must be running before using PocketBase MCP to create collections.

## Ports

| Service | Port | URL |
|---------|------|-----|
| Homepage | 3000 | http://localhost:3000 |
| Webapp | 3001 | http://localhost:3001 |
| Admin | 3002 | http://localhost:3002 |
| PocketBase | 8090 | http://localhost:8090 |
| PocketBase Admin | 8090 | http://localhost:8090/_/ |

## Documentation Lookup

**CRITICAL:** Before writing ANY PocketBase code, ALWAYS:
1. Check the current stable version via Context7
2. Verify the correct syntax for that version
3. PocketBase APIs change between versions - don't assume

```
"What is the current stable PocketBase JS SDK version and authentication syntax?"
"Show me the current PocketBase realtime subscription syntax"
```

**Key docs to check:**
- PocketBase JS SDK (frontend): authentication, CRUD, realtime, files
- PocketBase Hooks (backend): `$app`, `$http`, event handlers
- Express.js: routes, middleware (for Node.js server)

**CDN links:** Always verify CDN URLs exist before adding them. Check the actual CDN (jsdelivr, unpkg, cdnjs) for the correct version and path. Don't guess URLs - they change between versions.

**Updating PocketBase:** Version is set in `Dockerfile` (`POCKETBASE_VERSION`). Before updating:
1. Check changelog for breaking changes
2. Review existing hooks/migrations for incompatibilities
3. Test locally before deploying

## MCP Servers

| MCP Server | Purpose |
|------------|---------|
| `pocketbase` | Database operations |
| `context7` | Documentation lookup |
| `github` | Repo management |

**PocketBase MCP usage:**
- **Use for:** CRUD operations on records, status checks, reading schema info
- **Never for:** Creating or modifying collections - always use migrations instead (they're version controlled and reproducible across environments)

## Custom Commands

| Command | Description |
|---------|-------------|
| `/dev` | Start local development environment |
| `/stop` | Stop all local servers |
| `/db-status` | Check PocketBase health and collections |
| `/setup` | Initial project configuration guide |
| `/deploy` | Manual deployment instructions |
| `/commit` | Create a commit with consistent message format |
| `/migrate` | Guide for migrating existing projects |

## Commit Convention

```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

## PocketBase Notes

### Reserved System Routes

**NEVER overwrite these routes with custom hooks:**

| Route | Purpose |
|-------|---------|
| `/_/*` | Admin dashboard UI |
| `/api/health` | Health check endpoint |
| `/api/collections/*` | Collection schema CRUD |
| `/api/collections/{c}/records/*` | Record CRUD operations |
| `/api/collections/{c}/auth-*` | Authentication endpoints |
| `/api/files/*` | File serving |
| `/api/realtime` | SSE subscriptions |
| `/api/batch` | Batch requests |

**Safe pattern:** Use `/api/custom/` or `/api/myapp/` prefix for custom routes.

### Migrations with Field-Dependent Rules

When creating collections with rules that reference fields (e.g., `@request.auth.id = user.id`), PocketBase v0.23+ validates rules by default before fields are registered.

**Solution: Use `saveNoValidate()`** to bypass validation when rules reference the collection's own fields:

```javascript
migrate((app) => {
  const usersCollection = app.findCollectionByNameOrId("users");
  const collection = new Collection({
    name: "todos",
    type: "base",
    listRule: "@request.auth.id = user.id",
    viewRule: "@request.auth.id = user.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id = user.id",
    deleteRule: "@request.auth.id = user.id",
    fields: [
      { type: "text", name: "title", required: true },
      { type: "bool", name: "completed" },
      { type: "relation", name: "user", collectionId: usersCollection.id, required: true },
      // Always include autodate fields:
      { type: "autodate", name: "created", onCreate: true, onUpdate: false },
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true }
    ]
  });
  app.saveNoValidate(collection);  // Bypasses rule validation
}, (app) => {
  app.delete(app.findCollectionByNameOrId("todos"));
});
```

**Caution:** `saveNoValidate()` skips ALL validation. Ensure your schema is correct before using it. For simple cases, prefer the **PocketBase MCP** which handles this automatically.

### Migration Tracking

**Filename format:** `<unix_timestamp_seconds>_<name>.js` (e.g., `1737451234_create_todos.js`)

**Auto-apply:** PocketBase automatically applies pending migrations on startup. No manual commands needed.

**Checking status:** Migrations that have been applied are tracked in PocketBase's internal `_migrations` table. You can verify applied migrations:
- Check PocketBase startup logs for "Applied migration: ..."
- Query `SELECT * FROM _migrations` in PocketBase Admin SQL console
- If a collection exists with correct schema, the migration ran successfully

**Workflow:**
1. Create migration file in `api/pb_migrations/`
2. Restart PocketBase (or `docker compose restart pocketbase`)
3. Migration applies automatically - check logs to confirm

### Hooks Runtime (GOJA)

Hooks run in **GOJA** (Go-based JS interpreter), not Node.js.

**PocketBase globals:**

| Global | Purpose |
|--------|---------|
| `$app` | PocketBase application instance |
| `$http` | HTTP client (`$http.send()`) |
| `$os` | OS operations, env vars, shell commands |
| `$security` | JWT, encryption, random strings |
| `$mails` | Email sending |
| `$filesystem` | File operations |
| `$filepath` | Path utilities |
| `$dbx` | Database query builder |
| `$apis` | API routing helpers |
| `$template` | Template rendering |

**Also available:**
- `require()` for local CommonJS modules (not npm)
- `cronAdd()` / `cronRemove()` for scheduled tasks
- `routerAdd()` / `routerUse()` for custom routes
- `sleep()` for delays
- 100+ hook functions (`onRecordCreate`, `onMailerSend`, etc.)

**NOT available:**
- npm packages
- `fetch()` - use `$http.send()` instead
- `async`/`await`, `Promise` - everything is synchronous
- Node.js APIs (`fs`, `buffer`, `crypto`)
- Browser APIs (`window`, `document`)

**Full reference:** https://pocketbase.io/jsvm/index.html

### JS SDK Patterns (Frontend)

**Safe filters:** Never use string interpolation for filters (injection risk). Use `api.filter()`:

```javascript
// BAD - injection risk
filter: `user = "${userId}"`

// GOOD - safe parameterized filter
filter: api.filter('user = {:userId}', { userId: api.currentUser().id })
```

**Auto-cancellation:** PocketBase JS SDK auto-cancels duplicate requests with the same signature. To disable (e.g., for parallel requests):

```javascript
api.list('collection', 1, 20, { requestKey: null })
```

## Hot Reload

- **Static files:** Changes to `homepage/`, `webapp/`, `admin/` are immediate
- **Server code:** Changes to `server/*.js` auto-restart via Node.js `--watch`
- **PocketBase hooks:** Changes to `api/pb_hooks/` require container restart

## Webapp Starter Code

The webapp includes example CRUD code in `webapp/js/app.js` demonstrating:
- List, create, update, delete operations
- Realtime subscriptions for live updates
- User-owned data patterns

This example works with a "todos" collection. **Delete the example sections** (marked with comments) when building your own app.

## Coding Guidelines

- **NEVER create PocketBase superuser/admin accounts.** If you see "create superuser" in logs, tell the user: "PocketBase needs an admin account. Please create one at http://localhost:8090/_/ or re-run the install script." Do NOT run `pocketbase superuser` yourself.
- **Design fresh for each project.** The boilerplate's auth UI and example code are starting points, not templates to copy. Think about what design, layout, and UX patterns best fit the specific project being built.
- Only use PocketBase Authentication. Don't implement auth yourself.
- Update this file when making significant changes to structure or architecture.

## Notes

[Add any project-specific notes, decisions, or gotchas here]

---

**Last updated:** [DATE]
**Updated by:** [Claude/Human]
