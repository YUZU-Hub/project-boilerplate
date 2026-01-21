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

# Wait for PocketBase to be healthy
echo "→ Waiting for PocketBase to be ready..."
CONTAINER_NAME="${PROJECT_NAME}-app-1"
for i in 1 2 3 4 5 6 7 8 9 10; do
    if docker exec "$CONTAINER_NAME" wget -q --spider http://localhost:8090/api/health 2>/dev/null; then
        break
    fi
    sleep 2
done

# Prompt for admin credentials (read from /dev/tty for curl pipe compatibility)
echo ""
echo "→ Setting up PocketBase admin account"
echo ""
printf "  Admin email: "
read ADMIN_EMAIL < /dev/tty
printf "  Admin password: "
stty -f /dev/tty -echo 2>/dev/null || stty -echo < /dev/tty 2>/dev/null || true
read ADMIN_PASSWORD < /dev/tty
stty -f /dev/tty echo 2>/dev/null || stty echo < /dev/tty 2>/dev/null || true
echo ""

# Create the superuser
echo "→ Creating admin account..."
if docker exec "$CONTAINER_NAME" /pb/pocketbase superuser upsert "$ADMIN_EMAIL" "$ADMIN_PASSWORD" --dir=/pb/pb_data 2>/dev/null; then
    echo "  ✓ Admin account created"
else
    echo "  ⚠ Could not create admin (may already exist)"
fi

# Offer to configure MCP credentials
echo ""
printf "→ Add credentials to ~/.zshrc for Claude Code MCP? [Y/n] "
read CONFIGURE_MCP < /dev/tty
if [ "$CONFIGURE_MCP" != "n" ] && [ "$CONFIGURE_MCP" != "N" ]; then
    # Check if already configured
    if grep -q "POCKETBASE_ADMIN_EMAIL" ~/.zshrc 2>/dev/null; then
        # Update existing
        sed -i.bak "s|^export POCKETBASE_ADMIN_EMAIL=.*|export POCKETBASE_ADMIN_EMAIL=\"$ADMIN_EMAIL\"|" ~/.zshrc
        sed -i.bak "s|^export POCKETBASE_ADMIN_PASSWORD=.*|export POCKETBASE_ADMIN_PASSWORD=\"$ADMIN_PASSWORD\"|" ~/.zshrc
        rm -f ~/.zshrc.bak
        echo "  ✓ Updated existing credentials in ~/.zshrc"
    else
        # Add new
        echo "" >> ~/.zshrc
        echo "# PocketBase MCP credentials" >> ~/.zshrc
        echo "export POCKETBASE_ADMIN_EMAIL=\"$ADMIN_EMAIL\"" >> ~/.zshrc
        echo "export POCKETBASE_ADMIN_PASSWORD=\"$ADMIN_PASSWORD\"" >> ~/.zshrc
        echo "  ✓ Added credentials to ~/.zshrc"
    fi
    echo "  Run: source ~/.zshrc"
fi

echo ""
echo "  ✓ Ready!"
echo ""
echo "  Your app is running at:"
echo "    Homepage:    http://localhost:$HOMEPAGE_PORT"
echo "    Webapp:      http://localhost:$WEBAPP_PORT"
echo "    Admin:       http://localhost:$ADMIN_PORT"
echo "    PocketBase:  http://localhost:$POCKETBASE_PORT/_/"
echo ""
echo "  Start building:"
echo "    cd $PROJECT_NAME"
echo "    claude \"Build a todo app with user auth\""
echo ""
