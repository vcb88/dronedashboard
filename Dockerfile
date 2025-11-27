# Use the official Node-RED image as a base
# The -v18 tag specifies the Node.js version to align with our development environment
FROM nodered/node-red:latest-18

# The project files will be placed inside this directory in the container
WORKDIR /usr/src/node-red

# Copy Node-RED configuration and flow files
COPY ./nodered/settings.js /data/settings.js
COPY ./nodered/flows.json /data/flows.json

# Copy the Python script for DroneCAN
COPY ./nodered/dronecan_listener.py /data/dronecan_listener.py

# Copy the pre-built React frontend to the static directory
# This path is configured in our custom settings.js
COPY ./frontend/dist /data/frontend_dist

# Switch to root user to install system and Python dependencies
USER root

# Install Python, pip, and other necessary build tools
RUN apk add --no-cache python3 py3-pip build-base

# Install the dronecan Python library
RUN pip3 install dronecan

# Switch back to the node-red user
USER node-red
