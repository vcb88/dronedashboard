#!/bin/sh
set -e

echo "--- Deploying dronedashboard ---"
echo "$GHCR_PAT" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin

docker-compose -f docker-compose.yml pull
docker-compose -f docker-compose.yml up -d --remove-orphans

echo "--- Deployment of dronedashboard complete ---"