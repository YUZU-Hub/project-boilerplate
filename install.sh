#!/bin/sh
set -e

# Vibe Coding Boilerplate Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/your-org/boilerplate/main/install.sh | sh -s myproject

REPO_URL="https://github.com/YUZU-Hub/project-boilerplate.git"
PROJECT_NAME="${1:-myproject}"

echo ""
echo "  Vibe Coding Boilerplate"
echo "  ========================"
echo ""

# Check dependencies
if ! command -v git >/dev/null 2>&1; then
    echo "Error: git is required but not installed."
    exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
    echo "Error: docker is required but not installed."
    exit 1
fi

# Clone
echo "→ Creating project: $PROJECT_NAME"
git clone --depth 1 "$REPO_URL" "$PROJECT_NAME"
cd "$PROJECT_NAME"
rm -rf .git
git init

# Setup
echo "→ Setting up environment"
cp .env.example .env

# Check for port conflicts and auto-set PORT_OFFSET if needed
check_port() {
    if command -v lsof >/dev/null 2>&1; then
        lsof -i:"$1" >/dev/null 2>&1 && return 1
    elif command -v nc >/dev/null 2>&1; then
        nc -z localhost "$1" >/dev/null 2>&1 && return 1
    fi
    return 0
}

find_free_offset() {
    for offset in 0 1000 2000 3000 4000 5000; do
        all_free=true
        for port in 3000 3001 3002 8090; do
            test_port=$((port + offset))
            if ! check_port "$test_port"; then
                all_free=false
                break
            fi
        done
        if [ "$all_free" = true ]; then
            echo "$offset"
            return 0
        fi
    done
    echo "0"  # Default, let Docker fail with a clear message
}

# Check default ports
echo "→ Checking for port conflicts..."
PORT_OFFSET=$(find_free_offset)
if [ "$PORT_OFFSET" != "0" ]; then
    echo "  Port conflict detected, using offset: $PORT_OFFSET"
    # Update ports in .env
    sed -i.bak "s/HOMEPAGE_PORT=3000/HOMEPAGE_PORT=$((3000 + PORT_OFFSET))/" .env
    sed -i.bak "s/WEBAPP_PORT=3001/WEBAPP_PORT=$((3001 + PORT_OFFSET))/" .env
    sed -i.bak "s/ADMIN_PORT=3002/ADMIN_PORT=$((3002 + PORT_OFFSET))/" .env
    sed -i.bak "s/POCKETBASE_PORT=8090/POCKETBASE_PORT=$((8090 + PORT_OFFSET))/" .env
    sed -i.bak "s|API_URL=http://localhost:8090|API_URL=http://localhost:$((8090 + PORT_OFFSET))|" .env
    rm -f .env.bak

    HOMEPAGE_PORT=$((3000 + PORT_OFFSET))
    WEBAPP_PORT=$((3001 + PORT_OFFSET))
    ADMIN_PORT=$((3002 + PORT_OFFSET))
    POCKETBASE_PORT=$((8090 + PORT_OFFSET))
else
    HOMEPAGE_PORT=3000
    WEBAPP_PORT=3001
    ADMIN_PORT=3002
    POCKETBASE_PORT=8090
fi

# Start
echo "→ Starting services (this may take a minute on first run)"
docker compose up --build -d

# Wait for services and extract PocketBase installer URL
echo "→ Waiting for services to be ready..."
sleep 3

# Try to extract the installer URL from logs (contains auth token)
INSTALLER_URL=""
for i in 1 2 3 4 5; do
    INSTALLER_URL=$(docker compose logs 2>/dev/null | grep -o "http://[^[:space:]]*/_/?installer#[^[:space:]]*" | head -1)
    if [ -n "$INSTALLER_URL" ]; then
        # Replace internal port with external port
        INSTALLER_URL=$(echo "$INSTALLER_URL" | sed "s|:8090|:$POCKETBASE_PORT|")
        break
    fi
    sleep 2
done

echo ""
echo "  ✓ Ready!"
echo ""
echo "  Your app is running at:"
echo "    Homepage:    http://localhost:$HOMEPAGE_PORT"
echo "    Webapp:      http://localhost:$WEBAPP_PORT"
echo "    Admin:       http://localhost:$ADMIN_PORT"
echo ""
echo "  Next steps:"
echo ""
echo "  1. Create PocketBase admin account:"
if [ -n "$INSTALLER_URL" ]; then
    echo "     $INSTALLER_URL"
else
    echo "     http://localhost:$POCKETBASE_PORT/_/"
fi
echo ""
echo "  2. Configure MCP credentials (add to ~/.zshrc):"
echo "     export POCKETBASE_ADMIN_EMAIL=\"your-email@example.com\""
echo "     export POCKETBASE_ADMIN_PASSWORD=\"your-password\""
echo ""
echo "     Then run: source ~/.zshrc"
echo ""
echo "  3. Start building:"
echo "     cd $PROJECT_NAME"
echo "     claude \"Build a todo app with user auth\""
echo ""
