# Architecture Proposals for Drone Dashboard

This document presents three potential architectural options for the Drone Dashboard project. Each option considers the core requirements: data ingestion (MQTT, DroneCAN), real-time visualization, and log analysis.

---

### Key Requirements Summary

*   **Backend:** Must handle data processing. Python or Node.js are preferred.
*   **Frontend:** Must be lightweight for potential resource-constrained environments. React or Vue are preferred.
*   **Data Ingestion:** Must support MQTT and DroneCAN protocols.
*   **Real-time Communication:** Must push live data to the frontend efficiently (e.g., via WebSockets).
*   **Data Storage:** Must handle storing and retrieving session logs.
*   **Web Server:** Must serve the frontend application.

---

## Option 1: The Python-Centric Stack (FastAPI + Vue.js)

This option uses a robust Python backend with a lightweight and flexible Vue.js frontend.

*   **Backend:** **Python** with the **FastAPI** framework.
*   **Data Ingestion:** A standalone Python service using `paho-mqtt` and `dronecan` libraries. This service acts as a "collector," which listens to the data sources, processes/normalizes the data, and forwards it to the main FastAPI backend via an internal API call or a message queue.
*   **Real-time Channel:** **WebSockets** managed by FastAPI to stream data to connected frontend clients.
*   **Frontend:** A **Vue.js** Single-Page Application (SPA).
*   **Data Storage:** Simple and robust file-based storage on the device's filesystem for logs (e.g., structured JSON lines or CSV files).
*   **Web Server:** **Nginx** to serve the static Vue.js files and to act as a reverse proxy to the FastAPI backend API.

#### Pros:
*   **Robust & Scalable:** FastAPI is extremely fast and suitable for high-performance data processing.
*   **Strong Python Libraries:** Python has excellent, mature libraries for both MQTT and DroneCAN, simplifying the data ingestion logic.
*   **Clear Separation of Concerns:** The collector service, backend API, and frontend are all clearly decoupled, making them easier to develop, maintain, and debug independently.

#### Cons:
*   **Complexity:** This stack has the most moving parts (Collector, FastAPI, Nginx), which can increase initial setup and deployment complexity.
*   **Two Services:** Requires managing at least two separate Python processes (collector and backend API).

---

## Option 2: The Integrated Node-RED Stack

This option leverages Node-RED's strengths in IoT data flow management to act as the core of the system.

*   **Backend & Data Ingestion:** **Node-RED**. Its flow-based visual programming is ideal for handling data pipelines.
    *   **MQTT:** Natively supported with built-in nodes.
    *   **DroneCAN:** Can be integrated by using an `exec` node to call a dedicated Python script (since Node.js libraries for DroneCAN are less mature) or by creating a custom Node-RED node.
*   **Real-time Channel:** **WebSockets** are natively supported with built-in nodes, making it easy to stream data out to the frontend.
*   **Frontend:** A **React** Single-Page Application (SPA).
*   **Data Storage:** Node-RED flows can easily write log files to the local filesystem or a simple database like SQLite.
*   **Web Server:** The internal Node.js web server in Node-RED can be configured to serve the static React build files, simplifying the stack.

#### Pros:
*   **Rapid Prototyping:** The visual, flow-based nature of Node-RED makes it incredibly fast for setting up and modifying data pipelines.
*   **Simplified Stack:** Node-RED can potentially manage data ingestion, processing, the backend API, and serving the frontend, reducing the number of separate services to manage.
*   **Excellent IoT/MQTT Support:** Node-RED is purpose-built for this kind of data flow.

#### Cons:
*   **DroneCAN Integration:** May require a workaround (like calling a Python script), which makes the solution less elegant than a pure Node.js or Python stack.
*   **Scalability/Performance:** While excellent for many tasks, complex, high-throughput logic may be harder to optimize in Node-RED compared to pure code in FastAPI or Node.js.

---

## Option 3: The "All-in-One" JavaScript Stack (Next.js)

This option consolidates the frontend and backend into a single framework using Next.js, a popular React framework.

*   **Backend:** **Next.js API Routes**. This feature allows you to build a Node.js backend directly within your React project structure.
*   **Data Ingestion:** A background **Node.js service** (which could be part of the same project). This service would use libraries like `mqtt.js` and a Python script wrapper for DroneCAN. It would communicate with the Next.js backend.
*   **Real-time Channel:** A WebSocket server (e.g., using the `ws` library) can be integrated with the Next.js custom server environment.
*   **Frontend:** **Next.js (React)** by definition.
*   **Data Storage:** The backend can write logs to the filesystem.
*   **Web Server:** The Next.js development and production server is built-in. For production, you run it as a single standalone Node.js application.

#### Pros:
*   **Unified Language & Repository:** The entire application (frontend and backend) can be managed in a single language (JavaScript/TypeScript) and a single repository, simplifying development workflow and tooling.
*   **Simplified Deployment:** Can be deployed as a single Node.js process, making it very straightforward to manage.
*   **Strong React Ecosystem:** Leverages the vast ecosystem and component libraries available for React.

#### Cons:
*   **Resource Usage:** Next.js can be more resource-intensive than a simple static site server, which might be a consideration for a device like the Wiren Board.
*   **Complex Real-time Setup:** Integrating a custom WebSocket server with the Next-js dev/prod environment can be more complex than in FastAPI or Node-RED, which are designed for it.
*   **DroneCAN Integration:** Same challenge as Option 2; likely requires a Python script wrapper.
