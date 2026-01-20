# Start Development Environment

Start all services (Node.js servers + PocketBase) in Docker for local development.

## Start All Services

```bash
docker compose up --build -d
```

Wait for services to be ready:
```bash
until curl -s http://localhost:3000/health > /dev/null 2>&1 && curl -s http://localhost:8090/api/health > /dev/null 2>&1; do sleep 1; done
echo "All services are ready!"
```

## Available Services

| Service | URL |
|---------|-----|
| Homepage | http://localhost:3000 |
| Web App | http://localhost:3001 |
| Admin Dashboard | http://localhost:3002 |
| PocketBase API | http://localhost:8090 |
| PocketBase Admin | http://localhost:8090/_/ |

## View Logs

```bash
docker compose logs -f
```

## Hot Reload

- **Static files**: Changes to `homepage/`, `webapp/`, `admin/` are immediate
- **Server code**: Changes to `server/*.js` auto-restart via Node.js `--watch`
- **PocketBase hooks**: Changes to `api/pb_hooks/` require container restart
