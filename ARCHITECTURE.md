# Architecture for Drone Dashboard

## 1. Chosen Architecture: Microservice-based with Python Backend

The chosen architecture for the Drone Dashboard project is a **Microservice-based Stack** with a **Python FastAPI backend** for data processing and UI hosting. The services are orchestrated via Docker Compose and exposed through Traefik.

This approach was chosen for its balance of:
*   **Modularity:** Separating concerns into distinct services.
*   **Scalability:** Individual services can be scaled independently.
*   **Maintainability:** Clear separation of codebases.
*   **Performance:** Leveraging efficient Python frameworks (FastAPI) for backend logic.

## 2. Architectural Components & Current Implementation

*   **`emulator` Service:**
    *   **Description:** A Python service that simulates and publishes realistic drone telemetry data (`dronedata/telemetry`) and ESC data (`dronedata/esc`) to the MQTT broker. It replays pre-generated mission scenarios.
    *   **Implementation Status:** **Done**. Publishes both telemetry and ESC data.

*   **`mqtt-broker` Service:**
    *   **Description:** An Eclipse Mosquitto instance that acts as the central message bus for inter-service communication.
    *   **Implementation Status:** **Done**. Included in the Docker Compose setup.

*   **`dronedashboard` Service (Backend & Frontend):**
    *   **Description:** A Python FastAPI application that serves as both the backend data provider and the web server for the frontend.
    *   **Implementation Status:** **Done**. It:
        1.  Subscribes to MQTT topics (`dronedata/#`) for live data.
        2.  Provides a WebSocket endpoint (`/ws`) to stream live data to connected frontend clients.
        3.  Serves the static React frontend application (which is built into its Docker image via a multi-stage build).
        
*   **`dronecan_bridge` Service:**
    *   **Description:** A Python service that simulates a DroneCAN interface, generating and publishing ESC data (`dronedata/esc`) to the MQTT broker.
    *   **Implementation Status:** **Done**. (Note: This service is planned for removal in future iterations as the `emulator` takes over full data generation for both telemetry and ESC data, as outlined in the [Product Roadmap](./roadmap.md)).

*   **Frontend Application:**
    *   **Description:** A React Single-Page Application (SPA) built with Vite.
    *   **Implementation Status:** **Done**. The frontend can:
        1.  Visualize live ESC data on a dedicated chart (Voltage, Current, RPM).
        2.  Visualize live Telemetry data on a dedicated chart (Altitude, Speed).
        3.  Display the drone's real-time GPS location on an interactive map widget.

## 3. Data Flow Diagrams

### Live Data Flow
```
+----------+      +-------------+      +--------------------+      +-----------+      +----------+
| Emulator |----->| MQTT Broker |----->| Backend (FastAPI)  |----->| WebSocket |----->| Frontend |
+----------+      +-------------+      +--------------------+      +-----------+      +----------+
     ^                                           ^
     |                                           |
     +-------------------------------------------+
     (Publishes both Telemetry and ESC data)
```
*(Note: The `dronecan_bridge` service currently also publishes ESC data to the MQTT Broker, but its role will be consolidated into the `emulator`.)*

## 4. Future Development Roadmap

For planned future enhancements, please see the [Product Roadmap](./roadmap.md).

---
*(This document supersedes previous architectural descriptions and reflects the current implemented state.)*