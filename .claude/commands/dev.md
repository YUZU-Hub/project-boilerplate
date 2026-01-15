# Start Development Environment

Start both API and web servers for local development.

## Start API (PocketBase)

```bash
cd api && docker compose up -d
```

Wait for it to be ready:
```bash
until curl -s http://localhost:8090/api/health > /dev/null 2>&1; do sleep 1; done
echo "PocketBase is ready at http://localhost:8090/_/"
```

## Start Web Server

```bash
cd web && php -S localhost:8000
```

Web available at http://localhost:8000
