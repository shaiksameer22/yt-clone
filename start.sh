#!/bin/bash
set -e
echo "Building React frontend..."
cd frontend
npm run build
cd ..

echo "Starting Unified YouTube Clone Server..."
node server.js
