import time
import json
import random
import paho.mqtt.client as mqtt
import os

# --- MQTT Configuration ---
MQTT_BROKER_HOST = os.environ.get("MQTT_BROKER_HOST", "mqtt-broker")
MQTT_BROKER_PORT = int(os.environ.get("MQTT_BROKER_PORT", 1883))
MQTT_TOPIC = "dronedata/esc"
MQTT_CLIENT_ID = "dronecan_bridge"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
    else:
        print(f"Failed to connect, return code {rc}\n")

def setup_mqtt_client():
    client = mqtt.Client(client_id=MQTT_CLIENT_ID)
    client.on_connect = on_connect
    # Attempt to connect
    try:
        client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT)
    except ConnectionRefusedError:
        print("Connection to MQTT broker refused. Is it running?")
        return None
    except OSError as e:
        print(f"MQTT connection error: {e}. Retrying in 5 seconds...")
        return None
    return client

def main():
    print("DroneCAN to MQTT bridge started.", flush=True)

    client = None
    while client is None:
        client = setup_mqtt_client()
        if client is None:
            time.sleep(5)

    client.loop_start()

    # Mock data generation loop
    while True:
        try:
            # In a real implementation, you would use a subscriber callback.
            
            # Mock data for demonstration
            mock_data = {
                "timestamp": time.time(),
                "voltage": round(random.uniform(14.0, 16.8), 2),
                "current": round(random.uniform(5.0, 20.0), 2),
                "rpm": random.randint(8000, 15000)
            }
            
            payload = json.dumps(mock_data)
            result = client.publish(MQTT_TOPIC, payload)
            
            # Check if publish was successful
            if result.rc != mqtt.MQTT_ERR_SUCCESS:
                print(f"Failed to publish message to topic {MQTT_TOPIC}", flush=True)
            else:
                print(f"Published to {MQTT_TOPIC}: {payload}", flush=True)

            time.sleep(1)

        except KeyboardInterrupt:
            print("Bridge stopped.")
            break
        except Exception as e:
            print(f"An error occurred: {e}", flush=True)
            time.sleep(5)
    
    client.loop_stop()
    client.disconnect()

if __name__ == "__main__":
    main()