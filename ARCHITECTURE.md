# Architecture for Drone Dashboard

## 1. Chosen Architecture: Microservice-based with Node-RED

The chosen architecture for the Drone Dashboard project is a **Microservice-based Stack** with **Node-RED** at its core for data processing and UI hosting. The services are orchestrated via Docker Compose.

This approach was chosen for its balance of:
*   **Modularity:** Separating the data source (Emulator) from the main application logic.
*   **Resource Efficiency:** Using lightweight components suitable for running on edge devices like a Wiren Board.
*   **Rapid Prototyping:** Leveraging Node-RED's visual data flow programming.

## 2. Architectural Components & Current Implementation

*   **`emulator` Service:**
    *   **Description:** A standalone Python service that replays pre-generated, realistic flight mission data from a `.jsonl` file.
    *   **Implementation Status:** **Done**. It connects to the MQTT broker and publishes telemetry messages with realistic timing.

*   **`mqtt-broker` Service:**
    *   **Description:** An Eclipse Mosquitto instance that acts as the central message bus.
    *   **Implementation Status:** **Done**. Included in the Docker Compose setup.

*   **`dronedashboard` Service:**
    *   **Description:** A Node-RED instance that forms the core of the user-facing application.
    *   **Implementation Status:** **Done**. The flow is configured to:
        1.  Subscribe to the `dronedata/telemetry` MQTT topic.
        2.  Append all incoming messages to a log file (`/data/logs/full_archive.jsonl`).
        3.  Stream live data to the frontend via a WebSocket (`/ws/data`).
        4.  Provide an HTTP API endpoint (`/api/logs`) to list available log files.
        5.  Listen for "replay" commands from the frontend via WebSocket to stream archived files.
        6.  Host the static React frontend.
        
*   **Frontend Application:**
    *   **Description:** A React Single-Page Application (SPA) built with Vite.
    *   **Implementation Status:** **Done**. The frontend can:
        1.  Visualize live data on a chart.
        2.  Fetch and display a list of archived logs.
        3.  Request a log replay and display the replayed data.

## 3. Data Flow Diagrams

### Live Data & Archiving Flow
```
+----------+      +-------------+      +--------------------+      +-----------+      +----------+
| Emulator |----->| MQTT Broker |----->| Node-RED (mqtt-in) |----->| WebSocket |----->| Frontend |
+----------+      +-------------+      +--------------------+      +-----------+      +----------+
                                                 |
                                                 |
                                                 v
                                          +--------------+
                                          | Log File     |
                                          | (.jsonl)     |
                                          +--------------+
```

### Log Replay Flow
```
+----------+      +------------------+      +--------------------+      +-----------+
| Frontend |----->| WebSocket (send) |----->| Node-RED (ws-in)   |      |           |
| (Click)  |      | {"action":"replay"} |      | (Parses Command)   |      |           |
+----------+      +------------------+      +----------+---------+      |           |
                                                        |                |           |
                                                        v                |           |
                                             +----------+---------+      |           |
                                             | Reads Specified File |      |           |
                                             +----------+---------+      |           |
                                                        |                |           |
                                                        v                |           |
                                             +----------+---------+      |           |
                                             | Splits File by Line  |      |           |
                                             +--------------------+      |           |
                                                        |                |           |
                                                        v                |           |
+----------+      +--------------------+      +--------------------+      |           |
| Frontend |<-----| WebSocket (stream) |<-----| (Forwards each line) |<-----+           |
+----------+      +--------------------+      +--------------------+
```

## 4. Future Development Roadmap

For planned future enhancements, please see the [Product Roadmap](./roadmap.md).

---
*(This document supersedes the initial proposals and reflects the current implemented state.)*
