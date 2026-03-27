#!/bin/bash
set -e
echo "Building React frontend..."
export QT_QPA_PLATFORM=offscreen
cd frontend
npm run build
cd ..

echo "Starting Unified YouTube Clone Server..."
node server.js
