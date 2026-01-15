# Stop Development Environment

Stop all local development servers.

```bash
cd api && docker compose down
```

Note: PHP built-in server needs to be stopped manually (Ctrl+C) or:
```bash
pkill -f "php -S localhost:8000" 2>/dev/null || true
```
