#!/bin/bash
set -e

echo "=== Building Email/SMS Spam Classifier Backend ==="

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Backend build complete!"

