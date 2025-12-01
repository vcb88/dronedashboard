# Architecture Decision Record: Charting Library

This document records the decision regarding the choice of a charting library for the Drone Dashboard frontend.

## Context

The project requires a frontend library capable of visualizing real-time and archived time-series data. Key requirements include:
*   Ability to render line charts efficiently.
*   Support for real-time data updates via WebSockets.
*   Lightweight, to ensure good performance on potentially resource-constrained devices.
*   Good integration with the React ecosystem.

## Decision: Chart.js with `react-chartjs-2`

We have chosen to use **Chart.js** along with the **`react-chartjs-2`** wrapper as the primary charting library for this project.

### Rationale

1.  **Lightweight and Performant:** Chart.js is a dependency-free library with a relatively small bundle size, making it a good choice for performance-sensitive applications.
2.  **Ease of Use:** The API is straightforward and declarative, especially when used with the `react-chartjs-2` wrapper, which provides simple React components for each chart type. This allows for rapid development.
3.  **Good for Real-time Data:** It handles dynamic data updates efficiently. Updating the `data` prop of the component is sufficient to re-render the chart, which works well with our WebSocket-based architecture.
4.  **Sufficient for Core Needs:** For the primary requirement of time-series line charts, Chart.js provides all necessary features out-of-the-box, including tooltips, legends, and basic styling.

## Alternatives Considered

Several other popular libraries were considered.

### 1. Recharts

*   **Description:** A very popular, component-centric charting library for React. It encourages composing charts from declarative React components.
*   **Reason for Not Choosing:** While powerful, it can have a slightly larger bundle size than Chart.js. For our initial, straightforward needs, the simplicity of Chart.js was favored. Recharts could be a good candidate for future, more complex visualization needs.

### 2. ECharts for React

*   **Description:** A React wrapper for Apache ECharts, a very powerful and feature-rich charting library. It excels at complex, interactive, and aesthetically pleasing visualizations.
*   **Reason for Not Choosing:** ECharts is significantly heavier than Chart.js. Given that the dashboard might run on resource-constrained hardware, we opted for a more lightweight solution to begin with.

### 3. Nivo

*   **Description:** A rich library of data visualization components built on top of D3.js. It offers beautiful, responsive charts out-of-the-box.
*   **Reason for Not Choosing:** Similar to ECharts, Nivo can be larger than Chart.js. It's an excellent choice for data-heavy dashboards but was deemed slightly overkill for the initial real-time monitoring focus.

### 4. D3.js

*   **Description:** A low-level, extremely powerful JavaScript library for creating any data visualization imaginable. It is not a charting library but a tool to build charts with.
*   **Reason for Not Choosing:** D3.js provides maximum flexibility at the cost of maximum complexity. It would require building our charting components from scratch, which is far outside the scope and timeline for this project. Our goal is to use a pre-built charting solution, not to create one.

---

# Architecture Decision Record: Removal of Node-RED

This document records the decision to remove Node-RED from the core architecture and replace its functionalities with dedicated Python services.

## Context

Initially, Node-RED was chosen for its rapid prototyping capabilities and visual programming interface, serving as the central hub for MQTT data processing, WebSocket streaming, and frontend hosting. However, as the project evolved and requirements for performance, maintainability, and integration with Python-based simulation grew, the limitations of Node-RED became apparent.

## Decision: Replace Node-RED with Dedicated Python Services

Node-RED has been replaced by two new Python services:
1.  **`dronedashboard` Service (FastAPI Application):** Handles MQTT subscription, WebSocket streaming to the frontend, and serves the static React frontend application.
2.  **`dronecan_bridge` Service (Python Script):** Generates simulated ESC data and publishes it directly to MQTT. (Note: This service is planned for consolidation into the `emulator` in future iterations).

## Rationale

1.  **Improved Performance and Resource Efficiency:** Node-RED, being a full Node.js runtime with a visual editor, introduced significant overhead. Replacing it with lightweight FastAPI and Python scripts reduces resource consumption and improves overall performance.
2.  **Enhanced Maintainability and Scalability:** Python services are easier to test, debug, and maintain using standard software engineering practices. They offer better scalability options compared to a monolithic Node-RED instance.
3.  **Consistency with Python Ecosystem:** The `emulator` service is already in Python. Using Python for the new backend services creates a more consistent technology stack, simplifying development and future integrations.
4.  **Direct Control and Flexibility:** Custom Python code provides more direct control over data processing logic, allowing for more complex transformations and integrations than Node-RED's visual flows.
5.  **Simplified Deployment:** While the initial refactoring of CI/CD was complex, the resulting architecture is cleaner for deployment, with self-contained Docker images for each service.

## Alternatives Considered

1.  **Keep Node-RED:**
    *   **Reason for Not Choosing:** The overhead and limitations for implementing complex, custom logic (e.g., advanced data processing, custom APIs) outweighed the benefits of rapid prototyping. Debugging issues within Node-RED flows could also be challenging.
2.  **Replace with Node.js (Express/WebSocket):**
    *   **Reason for Not Choosing:** While a viable alternative, choosing Python maintained consistency with the existing `emulator` service and leveraged the team's Python expertise for backend development.