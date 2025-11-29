import datetime
import time
import json
import paho.mqtt.client as mqtt

# --- Configuration ---
MQTT_BROKER_HOST = "mqtt-broker"
MQTT_BROKER_PORT = 1883
MQTT_TOPIC = "dronedata/telemetry"
DATA_FILE = "mission_data.jsonl"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
    else:
        print(f"Failed to connect, return code {rc}\n")

def create_mqtt_client():
    """Creates and configures the MQTT client."""
    client = mqtt.Client()
    client.on_connect = on_connect
    
    while True:
        try:
            client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)
            break
        except ConnectionRefusedError:
            print("Connection to MQTT broker refused. Retrying in 5 seconds...")
            time.sleep(5)
            
    client.loop_start()
    return client

def stream_data(client):
    """Reads data from the file and streams it via MQTT."""
    print(f"Reading from data file: {DATA_FILE}")
    last_timestamp = None
    
    while True: # Loop forever to allow for continuous playback
        with open(DATA_FILE, 'r') as f:
            for line in f:
                try:
                    data_point = json.loads(line)
                    current_timestamp = data_point["timestamp"]

                    if last_timestamp is not None:
                        # Calculate delay to simulate real-time playback
                        delay = current_timestamp - last_timestamp
                        if delay > 0:
                            time.sleep(delay)
                    
                    # Use the current time for the timestamp to make it "live"
                    data_point["timestamp"] = int(time.time())
                    payload = json.dumps(data_point)
                    
                    result = client.publish(MQTT_TOPIC, payload)
                    status = result[0]
                    if status == 0:
                        timestamp_str = datetime.datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
                        print(f"{timestamp_str} Published to {MQTT_TOPIC}: altitude={data_point['altitude_relative']:.1f}m, mode={data_point['flight_mode']}")
                    else:
                        print(f"Failed to send message to topic {MQTT_TOPIC}")

                    last_timestamp = current_timestamp

                except json.JSONDecodeError:
                    print(f"Skipping malformed line: {line.strip()}")
                except Exception as e:
                    print(f"An error occurred: {e}")
                    time.sleep(1)
        
        print("Finished streaming file. Restarting from the beginning in 5 seconds...")
        last_timestamp = None
        time.sleep(5)


def main():
    """Main function to set up client and start streaming."""
    mqtt_client = create_mqtt_client()
    stream_data(mqtt_client)


if __name__ == "__main__":
    main()
