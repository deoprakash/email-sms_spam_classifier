#!/bin/bash
set -e

echo "=== Building Email/SMS Spam Classifier ==="

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install and build React frontend
echo "Installing React dependencies..."
npm --prefix frontend ci

echo "Building React frontend..."
npm --prefix frontend run build

echo "Build complete!"
echo "Frontend dist location: frontend/dist"
ls -la frontend/dist/ || echo "Warning: dist folder not found"
