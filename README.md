# Drone Dashboard

Drone Dashboard is a web service for real-time monitoring and post-session analysis of data from drone hardware tests. It uses a containerized, microservice-based architecture.

## Architecture Overview

The project consists of several containerized services orchestrated by Docker Compose and exposed via Traefik:

*   **Emulator (`emulator/`):** A Python service that simulates and publishes realistic drone telemetry (`dronedata/telemetry`) and ESC (`dronedata/esc`) data to the MQTT broker. It replays pre-generated mission scenarios.
*   **MQTT Broker (`mosquitto/`):** An Eclipse Mosquitto broker that handles message passing between services.
*   **Backend & Frontend Service (`backend_ws/`):** A Python FastAPI application that:
    *   Subscribes to MQTT topics (`dronedata/#`) for live data.
    *   Provides a WebSocket endpoint (`/ws`) to stream live data to connected frontend clients.
    *   Serves the React frontend application (which is built into its Docker image).
*   **DroneCAN Bridge (`dronecan_bridge/`):** A Python service that simulates a DroneCAN interface, generating and publishing ESC data to the MQTT broker. (Note: This service will be removed in future iterations as the Emulator takes over full data generation).

For a more detailed explanation of the architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Prerequisites

### For Running the Service (with Docker)
*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### For Development (to modify the code)
*   **Node.js:** Version 20.19+ or 22.12+ (for frontend development). We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
*   **npm:** Node Package Manager (comes with Node.js).
*   **Python:** Version 3.9+ (for backend and emulator services).

## How to Run

1.  **Clone the Repository:**
    ```sh
    git clone git@github.com:vcb88/dronedashboard.git
    cd dronedashboard
    ```

2.  **Build and Run the Services:**
    From the root of the `dronedashboard` directory, ensure your `DOCKER_USERNAME` environment variable is set (e.g., `export DOCKER_USERNAME=vcb88`) or pass it as an argument to `deploy.sh`.
    Then run the deployment script:
    ```sh
    ./deploy.sh your_docker_username
    ```
    This script will build the Docker images (if not already built by CI/CD) and start all services.

3.  **Access the Dashboard:**
    Open your web browser and navigate to the configured domain, e.g.:
    **[https://dronedashboard.site](https://dronedashboard.site)** (assuming Traefik is configured for HTTPS)

## How It Works

The dashboard displays real-time data from simulated drone missions.

### Live Data Flow
1.  The **Emulator** service starts and streams simulated telemetry (`dronedata/telemetry`) and ESC (`dronedata/esc`) data to the MQTT broker.
2.  The **Backend & Frontend Service** subscribes to `dronedata/#` on the MQTT broker, receiving all live data.
3.  The received data is immediately forwarded over a WebSocket to all connected frontend clients.
4.  The **Frontend** (React application) receives the WebSocket messages and updates the charts and map in real-time.
