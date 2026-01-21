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

# Start
echo "→ Starting services (this may take a minute on first run)"
docker compose up --build -d

# Wait for services
echo "→ Waiting for services to be ready..."
sleep 5

echo ""
echo "  ✓ Ready!"
echo ""
echo "  Your app is running at:"
echo "    Homepage:    http://localhost:3000"
echo "    Webapp:      http://localhost:3001"
echo "    Admin:       http://localhost:3002"
echo "    PocketBase:  http://localhost:8090/_/"
echo ""
echo "  Next steps:"
echo "    cd $PROJECT_NAME"
echo "    claude \"Build a todo app with user auth\""
echo ""
