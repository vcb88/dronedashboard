import asyncio
import json
import os
from contextlib import asynccontextmanager
import time

import paho.mqtt.client as mqtt
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles

# --- Configuration ---
MQTT_BROKER_HOST = os.environ.get("MQTT_BROKER_HOST", "mqtt-broker")
MQTT_BROKER_PORT = int(os.environ.get("MQTT_BROKER_PORT", 1883))
MQTT_TOPIC = "dronedata/#"
FRONTEND_DIR = "/app/frontend_dist"

# --- WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.loop = asyncio.get_event_loop()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# --- MQTT Client ---
def setup_mqtt_client():
    client = mqtt.Client()
    
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Backend_ws connected to MQTT Broker!")
            client.subscribe(MQTT_TOPIC)
        else:
            print(f"Backend_ws failed to connect to MQTT, return code {rc}\n")

    def on_message(client, userdata, msg):
        print(f"Received from MQTT: {msg.payload.decode()} on topic {msg.topic}")
        # Schedule the async broadcast function in the main event loop
        asyncio.run_coroutine_threadsafe(
            manager.broadcast(msg.payload.decode()),
            manager.loop
        )

    client.on_connect = on_connect
    client.on_message = on_message
    
    # Attempt to connect in a loop
    while True:
        try:
            client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)
            client.loop_forever() # This is a blocking call
        except ConnectionRefusedError:
            print("Backend_ws connection to MQTT broker refused. Retrying in 5s...")
            time.sleep(5)
        except Exception as e:
            print(f"An MQTT error occurred in backend_ws: {e}. Retrying in 5s...")
            time.sleep(5)


# --- FastAPI Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the MQTT client in a separate thread
    print("Starting MQTT client in background thread...")
    import threading
    # Ensure the manager has the correct event loop
    manager.loop = asyncio.get_running_loop()
    mqtt_thread = threading.Thread(target=setup_mqtt_client, daemon=True)
    mqtt_thread.start()
    yield
    print("Application shutdown.")

# --- FastAPI App ---
app = FastAPI(lifespan=lifespan)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    print(f"New WebSocket connection: {websocket.client}")
    try:
        while True:
            # Keep the connection alive by waiting for messages.
            # We don't expect any messages from the client, but this keeps the connection open.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"WebSocket disconnected: {websocket.client}")

# --- Static Files Mount ---
# This must be the last part of the file
if os.path.exists(FRONTEND_DIR):
    print(f"Serving static files from {FRONTEND_DIR}")
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")
else:
    print(f"Warning: Frontend directory '{FRONTEND_DIR}' not found.")
    @app.get("/")
    def read_root():
        return {"message": f"Hello from backend_ws. Frontend not found at {FRONTEND_DIR}."}
