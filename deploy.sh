#!/bin/sh
set -e

DOCKER_USERNAME=$1
export DOCKER_USERNAME

echo "--- Deploying dronedashboard ---"

docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "--- Deployment of dronedashboard complete ---"