#!/bin/sh
set -e

echo "Initializing root admin (if needed)..."
node scripts/initRootAdmin.js

echo "Starting main application..."
if [ "$1" ]; then
  exec "$@"
else
  exec node app.js 
fi