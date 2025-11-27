# Product Design Document: Drone Dashboard

## 1. Introduction

This document outlines the product requirements for "Drone Dashboard," a web service designed for monitoring and analyzing data from drone hardware tests. The system will visualize data received from various sensors and components connected through a central hub (e.g., Wiren Board), providing both real-time insights and post-session analysis capabilities.

## 2. Vision & Goal

The primary goal of the Drone Dashboard is to provide a unified, user-friendly interface for two key scenarios:

1.  **Real-Time Monitoring:** Live visualization of data streams from hardware under test (motors, flight controllers, servos, etc.). This allows operators and engineers to monitor the health and performance of the system during live tests.
2.  **Post-Session Analysis:** Viewing, exploring, and analyzing archived logs from past test sessions to identify trends, anomalies, and performance metrics.

## 3. Target Audience

The primary users of this service are:

*   **Drone Operators:** Individuals who manage and fly drones, needing real-time feedback on the vehicle's status.
*   **Test Engineers:** Individuals who conduct hardware-in-the-loop (HIL) or software-in-the-loop (SIL) tests on drone components and need a robust tool for data logging and analysis.

## 4. Core Data & Visualizations

### 4.1. Data Sources

The system will ingest data from drone hardware components, not the Wiren Board itself. The Wiren Board acts as a computational and connectivity hub. Key data sources include:

*   Motors
*   Motor Controllers (ESCs)
*   Servos
*   Flight Controllers
*   Sensors (IMU, GPS, barometer, etc.)
*   Power systems (battery voltage, current)

Data will be received via **MQTT** and **DroneCAN** protocols.

### 4.2. Visualization Types

The primary form of visualization will be **time-series charts**, allowing users to see how various parameters change over time. However, the system should be flexible enough to incorporate other visualization types as needed, such as:

*   Gauges for instantaneous values (e.g., current speed, battery level).
*   Indicator lights for status (e.g., GPS lock, system health).
*   Maps for GPS tracks.
*   Bar charts for summary statistics.

## 5. Features and Functionality

### 5.1. Real-Time Dashboard

*   **Default Visualizations:** For each distinct data type, the system will provide a default visualization option. Users will see relevant data presented automatically based on the incoming data streams.
*   **Alerts:** Implementation of a robust alerting system will be considered for a later development phase.

### 5.2. Archived Logs

*   **Input Formats:** The system must support importing log data in `CSV`, plain `TXT`, and `JSON` formats. The specific structure for these formats will be defined internally to optimize for visualization and analysis.
*   **Access Methods:**
    *   **On-board Storage:** Users can select and view archived logs directly from the Wiren Board's memory.
    *   **Local File Upload:** Users can upload log files from their local computer directly to the dashboard for analysis.
*   **Analysis Tools for Graphs:**
    *   **Zoom:** Ability to zoom in and out of specific time ranges or data points on a graph.
    *   **Timeline Navigation:** Seamless scrolling and panning across the historical timeline of the data.
    *   **Scaling:** Options to adjust the vertical and horizontal scales of graphs for better data interpretation.

### 5.3. Data Export

*   **Visualization Export:**
    *   **PNG:** Export static images of graphs and charts in PNG format.
    *   **PDF:** Export static images or entire dashboard views in PDF format.
*   **Raw Data Export:**
    *   **CSV:** Export underlying data tables in Comma Separated Values format.
    *   **JSON:** Export raw data in JavaScript Object Notation format.