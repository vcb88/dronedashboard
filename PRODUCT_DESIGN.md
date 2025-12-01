# Product Design Document: Drone Dashboard

## 1. Introduction

This document outlines the product requirements for "Drone Dashboard," a web service designed for monitoring and analyzing data from drone hardware tests. The system visualizes data received from simulated drone components, providing real-time insights.

## 2. Vision & Goal

The primary goal of the Drone Dashboard is to provide a unified, user-friendly interface for **Real-Time Monitoring** of data streams from simulated drone hardware (motors, flight controllers, sensors, etc.). This allows operators and engineers to monitor the health and performance of the system during simulated tests.

## 3. Target Audience

The primary users of this service are:

*   **Drone Operators:** Individuals who manage and fly drones, needing real-time feedback on the vehicle's status.
*   **Test Engineers:** Individuals who conduct hardware-in-the-loop (HIL) or software-in-the-loop (SIL) tests on drone components and need a robust tool for data visualization.

## 4. Core Data & Visualizations

### 4.1. Data Sources

The system ingests simulated data from drone components. Key data sources are currently simulated by:

*   **Emulator Service:** Generates telemetry data (GPS, altitude, speed, flight mode, battery status).
*   **DroneCAN Bridge Service:** Generates ESC data (motor voltage, current, RPM).

Data is transmitted via **MQTT** and processed by a Python backend before being streamed to the frontend via WebSockets.

### 4.2. Visualization Types

The current system provides:

*   **Time-series Charts:** Two dedicated charts visualize how various parameters change over time:
    *   **ESC Data Chart:** Displays Voltage, Current, and RPM.
    *   **Telemetry Data Chart:** Displays Altitude and Speed.
*   **Map Widget:** An interactive map displays the drone's real-time GPS location.

## 5. Features and Functionality

### 5.1. Real-Time Dashboard

*   **Live Data Display:** The dashboard presents two time-series charts for ESC and Telemetry data, and an interactive map showing the drone's current position.
*   **Connection Status:** Displays the current status of the WebSocket connection to the backend.
*   **Responsive Layout:** The dashboard layout adapts to different screen sizes, providing an optimal viewing experience.

---
*(This document supersedes previous product design descriptions and reflects the current implemented state.)*
