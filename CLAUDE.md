# Project: [PROJECT_NAME]

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

## Development Workflow

**Expected workflow:**
```bash
git clone <repo> myproject
cd myproject
cp .env.example .env
docker compose up --build -d    # Start services first
claude "Build a todo app with sharing"  # Then build with Claude
```

**Important:** Docker must be running before using PocketBase MCP to create collections. Changes to static files and server code hot-reload automatically.

**When building features:**
1. Create PocketBase collections via MCP (requires docker running)
2. Add frontend code to `webapp/` (hot-reloads)
3. Add hooks to `api/pb_hooks/` if needed (requires restart)
4. Test at http://localhost:3001

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
| `fetch` | HTTP/API testing |

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

When creating collections with rules that reference fields (e.g., `@request.auth.id = user.id`), the rules can't be set during initial creation because the fields don't exist yet.

**Use the PocketBase MCP** to create collections - it handles this automatically.

If writing migrations manually, split into two operations:

```javascript
// 1. Create collection WITHOUT rules
migrate((app) => {
  const collection = new Collection({
    name: "posts",
    type: "base",
    fields: [
      { name: "title", type: "text" },
      { name: "user", type: "relation", options: { collectionId: "users" } }
    ]
    // NO rules here - fields don't exist yet
  });
  app.save(collection);
}, (app) => {
  app.delete(app.findCollectionByNameOrId("posts"));
});

// 2. Add rules in a SEPARATE migration (runs after fields exist)
migrate((app) => {
  const collection = app.findCollectionByNameOrId("posts");
  collection.viewRule = "@request.auth.id != ''";
  collection.updateRule = "@request.auth.id = user.id";
  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("posts");
  collection.viewRule = null;
  collection.updateRule = null;
  app.save(collection);
});
```

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

## Hot Reload

- **Static files:** Changes to `homepage/`, `webapp/`, `admin/` are immediate
- **Server code:** Changes to `server/*.js` auto-restart via Node.js `--watch`
- **PocketBase hooks:** Changes to `api/pb_hooks/` require container restart

## Coding Guidelines

- Only use PocketBase Authentication. Don't implement auth yourself.
- Update this file when making significant changes to structure or architecture.

## Notes

[Add any project-specific notes, decisions, or gotchas here]

---

**Last updated:** [DATE]
**Updated by:** [Claude/Human]
