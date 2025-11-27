# Drone Dashboard - Product Roadmap

This document outlines the planned future enhancements and development priorities for the Drone Dashboard project. These proposals aim to significantly improve the user experience, functionality, and analytical capabilities of the dashboard.

## Vision

To evolve the Drone Dashboard from a basic real-time charting tool into a comprehensive and highly customizable platform for drone operators and test engineers, providing rich visualization, powerful analytical features, and a robust user experience.

## Proposed Frontend Enhancements

### 1. Multi-Widget Dashboard & Flexible Layout

**Current State:** The dashboard currently displays a single, hardcoded line chart.
**Goal:** Transform the dashboard into a dynamic, multi-widget interface, allowing users to view various data points simultaneously in different formats.
**Details:**
*   **Widget Types:** Introduce specialized widgets beyond line charts, such as:
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

---
**Next Steps:** These items will be prioritized and tackled based on user feedback and project requirements.
