#!/bin/sh
set -e

# Development entrypoint script
# Starts PocketBase and Node.js servers with watch mode for hot-reload

# Store PIDs for cleanup
POCKETBASE_PID=""
NODE_PID=""

# Graceful shutdown handler
cleanup() {
    echo "Shutting down..."

    if [ -n "$NODE_PID" ] && kill -0 "$NODE_PID" 2>/dev/null; then
        echo "Stopping Node.js servers..."
        kill -TERM "$NODE_PID" 2>/dev/null || true
        wait "$NODE_PID" 2>/dev/null || true
    fi

    if [ -n "$POCKETBASE_PID" ] && kill -0 "$POCKETBASE_PID" 2>/dev/null; then
        echo "Stopping PocketBase..."
        kill -TERM "$POCKETBASE_PID" 2>/dev/null || true
        wait "$POCKETBASE_PID" 2>/dev/null || true
    fi

    echo "Shutdown complete"
    exit 0
}

trap cleanup SIGTERM SIGINT

# Start PocketBase in background
echo "Starting PocketBase (development mode)..."
/pb/pocketbase serve --http=0.0.0.0:8090 --dir=/pb/pb_data --hooksDir=/pb/pb_hooks --migrationsDir=/pb/pb_migrations &
POCKETBASE_PID=$!

# Wait for PocketBase to be ready
echo "Waiting for PocketBase to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

until wget -q --spider http://localhost:8090/api/health 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "ERROR: PocketBase failed to start after $MAX_RETRIES attempts"
        exit 1
    fi
    echo "  Attempt $RETRY_COUNT/$MAX_RETRIES - PocketBase not ready yet..."
    sleep 1
done

echo "PocketBase is ready!"

# Start Node.js servers with watch mode
echo "Starting Node.js servers (watch mode for hot-reload)..."
cd /app/server && node --watch index.js &
NODE_PID=$!

echo ""
echo "Development servers started:"
echo "  - Homepage:    http://localhost:${HOMEPAGE_PORT:-3000}"
if [ -n "${WEBAPP_PORT}" ]; then
    echo "  - Webapp:      http://localhost:${WEBAPP_PORT}"
else
    echo "  - Webapp:      http://localhost:${HOMEPAGE_PORT:-3000}${WEBAPP_PATH:-/}"
fi
if [ -n "${ADMIN_PORT}" ]; then
    echo "  - Admin:       http://localhost:${ADMIN_PORT}"
else
    echo "  - Admin:       http://localhost:${HOMEPAGE_PORT:-3000}${ADMIN_PATH:-/admin}"
fi
echo "  - PocketBase:  http://localhost:8090"
echo "  - PB Admin:    http://localhost:8090/_/"
echo ""
echo "Hot-reload enabled - changes to server/*.js will auto-restart"
echo ""

# Wait for any process to exit
wait -n $POCKETBASE_PID $NODE_PID

# If we get here, a process exited unexpectedly
echo "A service exited unexpectedly, shutting down..."
cleanup
