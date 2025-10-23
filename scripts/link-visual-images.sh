#!/bin/bash

# Simple script to symlink visual test images to public folder
# Makes them accessible via /visual-images/*

cd "$(dirname "$0")/.."

# Create public directory if needed
mkdir -p public/visual-images

# Remove old symlinks
rm -f public/visual-images/baselines
rm -f public/visual-images/current
rm -f public/visual-images/diffs

# Create new symlinks
ln -sf "$(pwd)/tests/visual/baselines" public/visual-images/baselines
ln -sf "$(pwd)/tests/visual/current" public/visual-images/current
ln -sf "$(pwd)/tests/visual/diffs" public/visual-images/diffs

echo "✅ Visual test images linked to /public/visual-images"
