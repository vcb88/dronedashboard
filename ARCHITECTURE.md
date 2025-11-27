# Architecture for Drone Dashboard

## 1. Chosen Architecture: The Integrated Node-RED Stack

After discussion, the chosen architecture for the Drone Dashboard project is the **Integrated Node-RED Stack**.

This decision is based on the following key factors:
*   **Resource Efficiency:** The service will run directly on the Wiren Board, which has limited resources. Node-RED is lightweight and well-suited for this environment.
*   **Rapid Prototyping:** The flow-based nature of Node-RED allows for quick setup and modification of data pipelines, which is ideal for development and testing.
*   **Industry Standard:** Node-RED is a very common and well-supported tool in the IoT and MQTT ecosystem, making it a familiar choice for this domain.

### 1.1. Architectural Components

*   **Core Logic & Data Ingestion:** **Node-RED**. A single Node-RED instance will serve as the core of the application.
    *   **MQTT:** Data will be ingested using Node-RED's native `mqtt-in` nodes.
    *   **DroneCAN:** Data will be ingested via a Python script. A Node-RED `exec` node will be used to call this script and capture its standard output.
*   **Backend API & Real-time Channel:**
    *   Simple API endpoints (if needed) will be created using `http-in` nodes.
    *   Real-time data will be streamed to the frontend using `websocket-out` nodes.
*   **Frontend Application:** A **React** Single-Page Application (SPA), likely built with **Vite** for its lightweight nature.
*   **Web Server:** The Node-RED instance itself will be configured to serve the static build files of the React frontend. This creates a single, unified service.
*   **Data Storage:**
    *   **Archived Logs:** Node-RED will be responsible for writing incoming data to log files on the local filesystem (e.g., in CSV or JSON format).
    *   **Log Access:** The dashboard will allow users to either select a log file from the server's storage or upload a log file from their local machine.

### 1.2. Data Flow Diagram

```
[MQTT Broker] ----> (mqtt-in) ----> [Node-RED Flow] ----> (websocket-out) ----> [React Frontend]
                                          ^
[DroneCAN Bus] -> [Py Script] -> (exec) ---|---> [Log File]
```

## 2. Implementation Plan

1.  **Setup Node-RED:**
    *   Install Node-RED on the development machine.
    *   Configure `settings.js` to enable serving static files from a dedicated `frontend` directory.
    *   Create an initial `flows.json` with a basic MQTT -> WebSocket pipeline.
2.  **Scaffold Frontend:**
    *   Initialize a new React project using Vite in the `frontend` directory.
    *   Add a WebSocket client to connect to the Node-RED WebSocket endpoint.
    *   Integrate a charting library (e.g., Chart.js, ECharts) to visualize the data.
3.  **Develop DroneCAN Integration:**
    *   Create a Python script (`dronecan_listener.py`) that reads data from the CAN bus and prints it to standard output as JSON.
    *   Configure the `exec` node in Node-RED to run this script.
4.  **Develop Log Management:**
    *   Create Node-RED flows for writing incoming data to timestamped log files.
    *   Implement frontend components for uploading log files and selecting server-side log files for analysis.

---
*(This document supersedes the initial proposals)*