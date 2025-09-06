#!/usr/bin/env bash
# Streamline build + commit process for math-games submodule

set -e # exit on first error

# Step 1: Go into the games submodule
cd games

echo "Updating dependencies in math-games"
pnpm install

echo "Building math-games into ../dist/games/"
pnpm build

echo "Committing changes in math-games repo"
git add .
git commit -m "Update game source" || echo "No changes to commit in games repo"
git push origin main

# Step 2: Return to parent repo
cd ..

echo "Committing updated submodule pointer and dist build in parent repo"
git add games dist/games
git commit -m "Publish updated games build" || echo "No changes to commit in parent repo"
git push origin main

echo "Done! Visit: https://atishaya7777.github.io/games/"
