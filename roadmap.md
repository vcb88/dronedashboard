# Drone Dashboard - Product Roadmap

This document outlines the planned future enhancements and development priorities for the Drone Dashboard project. These proposals aim to significantly improve the user experience, functionality, and analytical capabilities of the dashboard.

## Vision

To evolve the Drone Dashboard from a basic real-time charting tool into a comprehensive and highly customizable platform for drone operators and test engineers, providing rich visualization, powerful analytical features, and a robust user experience.

## Proposed Frontend Enhancements

### 1. Multi-Widget Dashboard & Flexible Layout

**Current State:** The dashboard currently displays a single, hardcoded line chart.
**Goal:** Transform the dashboard into a dynamic, multi-widget interface, allowing users to view various data points simultaneously in different formats.
**Details:**
*   **Widget Types:** Introduce specialized widgets beyond line charts, suchs as:
    *   **Gauge Widget:** For displaying instantaneous numerical values (e.g., speed, battery percentage, motor RPM).
    *   **Indicator Widget:** Simple visual cues for binary states (e.g., `armed` status) or discrete values (e.g., `flight_mode` text display).
    *   **Map Widget:** To visualize GPS coordinates and flight paths in real-time or during log replay (e.g., using `react-leaflet`).
*   **Layout:** Implement a grid-based layout system (e.g., using a library like `react-grid-layout`) to enable users to arrange, resize, and potentially add/remove widgets.
**Benefits:** Provides a more comprehensive overview, enhances data interpretability, and increases user customization.

### 2. Selective Data Visualization

**Current State:** All available data channels (Voltage, Current, RPM) are plotted on the same chart by default.
**Goal:** Empower users to control which data series are displayed on a given chart.
**Details:**
*   Add UI controls (e.g., checkboxes, toggles, or a multi-select dropdown) adjacent to charting widgets.
*   Users can then toggle the visibility of individual datasets (e.g., only show 'Voltage', hide 'Current' and 'RPM').
**Benefits:** Reduces visual clutter, allows users to focus on specific parameters of interest, and improves analytical clarity.

### 3. Time Range Selection for Archived Data

**Current State:** When replaying an archived log, the entire file is streamed sequentially.
**Goal:** Enable users to define and analyze specific temporal segments within an archived log file.
**Details:**
*   Implement a time range selection mechanism (e.g., a date/time picker, sliders, or input fields) for log replay mode.
*   **Backend (Node-RED) Impact:** This will require modifications to the Node-RED replay flow to parse the time range command from the frontend, then read and filter the log file to stream only the data points within the specified interval.
**Benefits:** Crucial for in-depth analysis of specific events or phases within a long flight mission, enhancing the diagnostic capabilities of the dashboard.

### 4. General UI/UX Refinement

**Current State:** The frontend uses basic styling (Vite + React default CSS).
**Goal:** Achieve a more polished, consistent, and professional look and feel for the dashboard.
**Details:**
*   **CSS Framework Integration:** Integrate a lightweight and modern CSS framework (e.g., **Tailwind CSS** or **Bootstrap**) to standardize styling, improve responsiveness, and accelerate UI development.
*   **Visual Feedback:** Add loading indicators, error messages, and subtle animations where appropriate to improve the user experience.
*   **Layout & Spacing:** Improve the overall visual hierarchy, element spacing, and responsiveness for various screen sizes.
**Benefits:** Enhances user satisfaction, makes the application more intuitive and enjoyable to use, and presents a professional image.

## Proposed Backend Simulation Enhancements (Plausible Mission Simulation)

This section outlines a vision for enhancing the realism and consistency of the drone mission simulation data. The goal is to move away from purely random data generation towards a more dynamic and physically plausible flight model.

### Current Problem

The current simulation generates random telemetry and ESC data from two separate sources (`emulator` and `dronecan_bridge`). This leads to:
- Inconsistent correlation between speed, direction, and position changes on the map.
- Unrealistic speed changes, especially during turns.
- Disconnected flight dynamics (e.g., battery consumption not directly tied to flight effort).

### Vision for Plausible Mission Simulation

The proposed approach involves simulating a drone following a predefined flight path with realistic flight dynamics derived from a single, consistent simulation source.

### Key Principles:

1.  **Predefined Flight Path (Waypoints):** The drone will follow a sequence of geographical waypoints (latitude, longitude, altitude).
2.  **Realistic Movement Simulation:** Flight parameters (speed, heading, roll, pitch, altitude) will be dynamically calculated based on the mission plan and current drone state.
3.  **Consistent Data Generation:** Both telemetry and ESC-like data will be derived from this single, consistent simulation, ensuring all parameters are physically correlated.

### Proposed Implementation Steps:

1.  **Enhance `emulator/emulator.py`:**
    *   **Define Waypoints:** The script will contain a list of waypoints for the drone to follow.
    *   **Navigation Logic:** Implement a simple navigation algorithm to guide the drone between waypoints. This includes:
        *   Calculating distance and bearing to the next waypoint.
        *   Interpolating intermediate points for smooth movement.
        *   Adjusting speed (accelerating/decelerating) as needed.
        *   Simulating turns with appropriate changes in heading and roll.
    *   **Dynamic Flight Parameters:** Calculate `speed`, `heading`, `roll`, `pitch`, and `altitude` based on the drone's progress along the path.
    *   **Derive ESC Data:** From the simulated flight parameters (speed, acceleration, altitude changes), derive plausible `voltage`, `current`, and `rpm` values. For example, climbing or accelerating would increase current/RPM.
    *   **Publish Both Data Streams:** The `emulator.py` will publish both `dronedata/telemetry` (containing position, speed, altitude, etc.) and `dronedata/esc` (containing voltage, current, RPM) messages to MQTT.

2.  **Remove `dronecan_bridge` service:**
    *   Since `emulator.py` will now generate all necessary data, the `dronecan_bridge` service will become redundant and can be removed from the `docker-compose.prod.yml` file and the codebase.

3.  **Update `docker-compose.prod.yml`:**
    *   Remove the `dronecan_bridge` service definition.
    *   (Optional) Update `emulator` service configuration if new environment variables or parameters are introduced for mission control.

4.  **`backend_ws/main.py` and `frontend/src/App.jsx`:**
    *   No changes are expected in these components, as they are already designed to consume and display both `dronedata/telemetry` and `dronedata/esc` messages.

## Example Plausible Routes (Waypoints)

Here are a few examples of smoothed routes defined by key waypoints around Moscow. The drone would navigate between these points, with simulated acceleration/deceleration and turns.

### Route 1: Square around Central Moscow
A simple square path, returning to the start.
- **Waypoint 1 (Red Square):** `[55.7558, 37.6176, 100]` (Lat, Lon, Altitude in meters)
- **Waypoint 2 (North-East, Sokolniki):** `[55.7900, 37.7500, 120]`
- **Waypoint 3 (South-East, Kolomenskoye):** `[55.6800, 37.7500, 120]`
- **Waypoint 4 (South-West, Troparyovo):`[55.6800, 37.4500, 100]`
- **Waypoint 5 (North-West, Serebryany Bor):** `[55.7900, 37.4500, 100]`
- **Waypoint 6 (Back to Red Square):** `[55.7558, 37.6176, 100]`

### Route 2: Figure-Eight Pattern
A more dynamic route involving crossing paths.
- **Waypoint 1 (Start):** `[55.7558, 37.6176, 100]`
- **Waypoint 2 (North-East):** `[55.7900, 37.7500, 120]`
- **Waypoint 3 (South-West):** `[55.6800, 37.4500, 120]`
- **Waypoint 4 (North-West):** `[55.7900, 37.4500, 100]`
- **Waypoint 5 (South-East):** `[55.6800, 37.7500, 100]`
- **Waypoint 6 (Back to Start):** `[55.7558, 37.6176, 100]`

### Route 3: Altitude Change Mission
A mission demonstrating significant altitude changes.
- **Waypoint 1 (Start):** `[55.7558, 37.6176, 50]`
- **Waypoint 2 (Climb):** `[55.7600, 37.6200, 200]`
- **Waypoint 3 (Level Flight):** `[55.7650, 37.6250, 200]`
- **Waypoint 4 (Descend):** `[55.7700, 37.6300, 70]`
- **Waypoint 5 (Return Low):** `[55.7558, 37.6176, 50]`

This roadmap provides a clear direction for making the drone simulation more realistic and engaging for the dashboard.