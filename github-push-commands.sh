#!/bin/bash

# GitHub Backup Script for Spurgeon Property
# Run this script to push your code to GitHub

echo "Starting GitHub backup for Spurgeon Property..."

# Remove lock files if they exist
if [ -f .git/index.lock ]; then
    rm .git/index.lock
    echo "Removed index.lock"
fi

if [ -f .git/config.lock ]; then
    rm .git/config.lock
    echo "Removed config.lock"
fi

# Check Git status
echo "Checking Git status..."
git status

# Add all files
echo "Adding files to Git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Add comprehensive GitHub backup documentation and production password reset tools"

# Check if remote exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "Remote 'origin' already exists"
else
    echo "Adding GitHub remote..."
    git remote add origin https://github.com/MalcolmGov/spurgeon-property.git
fi

# Set main branch
echo "Setting main branch..."
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "GitHub backup complete!"
echo "Check your repository at: https://github.com/MalcolmGov/spurgeon-property"