# Drone Dashboard

Drone Dashboard is a web service for real-time monitoring and post-session analysis of data from drone hardware tests. It uses a containerized, microservice-based architecture.

## Architecture Overview

The project consists of three main services orchestrated by Docker Compose:

*   **Emulator (`emulator/`):** A Python service that simulates and publishes realistic drone telemetry data to the MQTT broker. It replays pre-generated mission scenarios.
*   **MQTT Broker (`mosquitto/`):** An Eclipse Mosquitto broker that handles message passing between services.
*   **Dashboard Service (`dronedashboard/`):** A Node-RED instance that:
    *   Subscribes to MQTT topics for live data.
    *   Saves all incoming data to log files.
    *   Serves the frontend application.
    *   Provides an API for listing logs and a WebSocket for data streaming.

For a more detailed explanation of the architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Prerequisites

### For Running the Service (with Docker)
*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### For Development (to modify the code)
*   **Node.js:** Version 20.19+ or 22.12+. We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
*   **npm:** Node Package Manager (comes with Node.js).
*   **Python:** Version 3.9+ for the emulator service.

## How to Run

1.  **Clone the Repository:**
    ```sh
    git clone git@github.com:vcb88/dronedashboard.git
    cd dronedashboard
    ```

2.  **Build and Run the Services:**
    From the root of the `dronedashboard` directory, run:
    ```sh
    docker-compose up --build
    ```
    This command will build the Docker images and start all three services.

3.  **Access the Dashboard:**
    Open your web browser and navigate to:
    **[http://localhost:1880](http://localhost:1880)**

## How It Works

The dashboard supports two main modes: **Live Data** and **Log Replay**.

### Live Data Flow
1.  The **Emulator** service starts automatically and begins streaming mission data to the `dronedata/telemetry` MQTT topic.
2.  The **Dashboard Service** (Node-RED) receives the message.
3.  The message is immediately **archived** by appending it to `/logs/full_archive.jsonl`.
4.  The message is also forwarded over a WebSocket to all connected frontend clients.
5.  The **Frontend** receives the WebSocket message and updates the charts in real-time.

### Log Replay Flow
1.  The frontend fetches a list of available logs via the `/api/logs` endpoint.
2.  When a user clicks "Replay" on a log file, the frontend sends a WebSocket command to the backend (e.g., `{"action": "replay", "file": "..."}`).
3.  Node-RED receives the command, reads the specified log file, and streams its contents line-by-line over the WebSocket to the frontend.
4.  The frontend displays the replayed data on the charts.