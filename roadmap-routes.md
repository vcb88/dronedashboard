# Roadmap: More Plausible Drone Mission Simulation

This document outlines a vision for enhancing the realism and consistency of the drone mission simulation data. The goal is to move away from purely random data generation towards a more dynamic and physically plausible flight model.

## Current Problem

The current simulation generates random telemetry and ESC data from two separate sources (`emulator` and `dronecan_bridge`). This leads to:
- Inconsistent correlation between speed, direction, and position changes on the map.
- Unrealistic speed changes, especially during turns.
- Disconnected flight dynamics (e.g., battery consumption not directly tied to flight effort).

## Vision for Plausible Mission Simulation

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
- **Waypoint 4 (South-West, Troparyovo):** `[55.6800, 37.4500, 100]`
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
