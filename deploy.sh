#!/bin/sh
set -e

echo "--- Deploying dronedashboard ---"

docker-compose -f docker-compose.prod.yml up -d --remove-orphans

echo "--- Deployment of dronedashboard complete ---"