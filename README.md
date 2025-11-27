# Drone Dashboard

Drone Dashboard is a web service for real-time monitoring and post-session analysis of data from drone hardware tests. It leverages Node-RED for data ingestion and processing, and a React-based frontend for visualization.

## Running with Docker (Recommended)

This is the easiest way to get the entire service stack up and running.

### Prerequisites

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### Steps

1.  **Clone the Repository:**
    ```sh
    git clone git@github.com:vcb88/dronedashboard.git
    cd dronedashboard
    ```

2.  **Build and Run the Services:**
    From the root of the `dronedashboard` directory, run:
    ```sh
    docker-compose up --build
    ```
    This command will:
    *   Build the `dronedashboard` Docker image based on the `Dockerfile`.
    *   Start the `dronedashboard` service.
    *   Start the `mqtt-broker` service (Eclipse Mosquitto).

3.  **Access the Dashboard:**
    Open your web browser and navigate to:
    **[http://localhost:1880](http://localhost:1880)**

4.  **Test MQTT:**
    You can publish MQTT messages to the `mqtt-broker` service, which is running on port `1883`. Use the same testing instructions as in the "Manual Setup" section. The key difference is that the broker is now conveniently running inside a Docker container.

## Manual Setup (Without Docker)

### Prerequisites

*   **Node.js:** Version 20.19+ or 22.12+. You can use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
*   **npm:** Node Package Manager (usually comes with Node.js).
*   **Node-RED:** A flow-based development tool for visual programming. Install it globally:
    ```sh
    npm install -g --unsafe-perm node-red
    ```
*   **Python:** Version 3.6+ to run the DroneCAN listener script.
*   **MQTT Broker (Optional but Recommended):** For testing the MQTT data flow. [Mosquitto](https://mosquitto.org/) is a popular and lightweight option.

### Installation

1.  **Clone the Repository:**
    ```sh
    git clone git@github.com:vcb88/dronedashboard.git
    cd dronedashboard
    ```

2.  **Install Frontend Dependencies:**
    Navigate to the frontend directory and install the required npm packages.
    ```sh
    cd frontend
    npm install
    cd ..
    ```
    
3. **Build Frontend Application:**
    Before running Node-RED for the first time, you need to build the React application so that the static files are available to be served.
    ```sh
    cd frontend
    npm run build
    cd ..
    ```

### Running the Application

1.  **Navigate to the Project Root:**
    Make sure you are in the `dronedashboard` directory.

2.  **Start Node-RED:**
    Run the following command to start the Node-RED server with the project's specific configuration:
    ```sh
    node-red -u ./nodered -s ./nodered/settings.js ./nodered/flows.json
    ```
    *   `-u ./nodered`: Sets the user directory to our `./nodered` folder.
    *   `-s ./nodered/settings.js`: Specifies the settings file, which includes the configuration to serve our frontend.
    *   `./nodered/flows.json`: Specifies the flow file to load on startup.

3.  **Access the Dashboard:**
    Once Node-RED is running, open your web browser and navigate to:
    **[http://localhost:1880](http://localhost:1880)**

    You should see the Drone Dashboard interface with a real-time chart.

### How to Test

#### 1. Test Emulated DroneCAN Data

The application is configured to automatically start a Python script that emulates DroneCAN data. As soon as you launch the application, you should see the chart on the dashboard start updating with random data for Voltage, Current, and RPM.

#### 2. Test MQTT Data

1.  **Ensure MQTT Broker is Running:** Make sure you have a local MQTT broker running on the default port `1883`.

2.  **Publish a Test Message:**
    Use any MQTT client (like `mqtt-explorer` or the command-line tool `mosquitto_pub`) to publish a message.

    *   **Topic:** `dronedata/telemetry`
    *   **Payload (JSON):**
        ```json
        {
            "payload": {
                "voltage": 15.5,
                "current": 10.2,
                "rpm": 12000
            }
        }
        ```

    When you publish the message, the chart on the dashboard should update with the new data point.