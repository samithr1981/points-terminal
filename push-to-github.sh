#!/bin/bash
# push-to-github.sh
# One-shot script to push points-terminal to your GitHub repo.
# Run this from INSIDE the unzipped points-terminal/ directory.

set -e  # Exit on any error

echo "🪙 Points Terminal — GitHub push helper"
echo "========================================"
echo ""

# Sanity check
if [ ! -f "package.json" ] || [ ! -d "data/cards" ]; then
  echo "❌ This doesn't look like the points-terminal directory."
  echo "   Please cd into the unzipped points-terminal/ folder first."
  exit 1
fi

# Check git identity
if ! git config user.email > /dev/null 2>&1; then
  echo "⚠️  Git user.email is not set. Setting it requires your input."
  read -p "Your GitHub email: " email
  read -p "Your GitHub username (display name): " name
  git config --global user.email "$email"
  git config --global user.name "$name"
  echo "✓ Git identity configured"
  echo ""
fi

# Initialize repo
if [ -d ".git" ]; then
  echo "⚠️  .git directory already exists. Skipping 'git init'."
else
  git init
  echo "✓ git init"
fi

# Ensure main branch
git branch -M main 2>/dev/null || true

# Stage everything
git add .
echo "✓ Staged $(git diff --cached --name-only | wc -l | tr -d ' ') files"

# Initial commit
if git log -1 > /dev/null 2>&1; then
  echo "⚠️  Commits already exist. Skipping initial commit."
else
  git commit -m "Initial commit: Points Terminal v0.3.0

- 49 cards across 14 Indian banks
- 38 redemption partners across 8 categories
- Three-tier valuations (floor/realistic/ceiling)
- Git-versioned YAML data with CI validation
- React + Vite dashboard with gap analysis
- Auto-deploy via GitHub Pages"
  echo "✓ Initial commit created"
fi

# Set remote
REPO_URL="https://github.com/samithr1981/points-terminal.git"
if git remote get-url origin > /dev/null 2>&1; then
  CURRENT_URL=$(git remote get-url origin)
  if [ "$CURRENT_URL" != "$REPO_URL" ]; then
    git remote set-url origin "$REPO_URL"
    echo "✓ Updated remote to $REPO_URL"
  else
    echo "⚠️  Remote 'origin' already set to $REPO_URL"
  fi
else
  git remote add origin "$REPO_URL"
  echo "✓ Added remote origin → $REPO_URL"
fi

echo ""
echo "📤 Ready to push. About to run: git push -u origin main"
echo ""
echo "If this is your first push, GitHub will ask for:"
echo "  Username: samithr1981"
echo "  Password: a personal access token (NOT your GitHub password)"
echo ""
echo "Create a token at: https://github.com/settings/tokens"
echo "  - Classic token, scopes needed: 'repo'"
echo "  - Or use 'gh auth login' if you have GitHub CLI installed"
echo ""
read -p "Press Enter to push (or Ctrl+C to abort) ..."

git push -u origin main

echo ""
echo "✅ Done. Your repo is live at:"
echo "   https://github.com/samithr1981/points-terminal"
echo ""
echo "Next steps:"
echo "  1. Visit Settings → Pages → Source: GitHub Actions"
echo "     (this enables auto-deploy; first deploy takes ~2 min)"
echo "  2. Your live dashboard will be at:"
echo "     https://samithr1981.github.io/points-terminal/"
echo "  3. Post to LinkedIn with the screenshot + repo link in first comment"
