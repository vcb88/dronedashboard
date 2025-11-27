# Drone Dashboard

Drone Dashboard is a web service for real-time monitoring and post-session analysis of data from drone hardware tests. It uses a containerized architecture with Docker Compose.

The stack includes:
*   **Emulator:** A Python service that simulates and publishes drone telemetry data via MQTT.
*   **MQTT Broker:** An Eclipse Mosquitto broker to handle message passing.
*   **Dashboard Service:** A Node-RED instance that subscribes to MQTT, processes data, and serves a React-based frontend via WebSockets.
*   **Frontend:** A React single-page application for data visualization.

## Prerequisites

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

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
    This command will:
    *   Build the `emulator` Docker image.
    *   Build the `dronedashboard` (Node-RED + Frontend) Docker image.
    *   Start all services (`emulator`, `dronedashboard`, `mqtt-broker`).

3.  **Access the Dashboard:**
    Open your web browser and navigate to:
    **[http://localhost:1880](http://localhost:1880)**

## How It Works

*   The **Emulator** service starts automatically and begins streaming the pre-generated mission data from `mission_data.jsonl` to the `dronedata/telemetry` topic on the MQTT broker.
*   The **Dashboard Service** (Node-RED) subscribes to this topic.
*   As soon as Node-RED receives a message, it forwards it over a WebSocket to the frontend.
*   The **Frontend** receives the WebSocket message and updates the charts in real-time.

Because the emulator runs automatically, you should see the charts on the dashboard come to life with simulated mission data shortly after launching the application. The simulated data will loop continuously.
