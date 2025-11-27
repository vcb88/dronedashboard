# Placeholder for DroneCAN Listener
# This script will be responsible for connecting to the DroneCAN bus,
# listening for messages, and printing them to standard output as JSON.
# Node-RED will execute this script and parse its output.

import time
import json
import random

def main():
    # This is a mock implementation.
    # In a real scenario, you would initialize the DroneCAN interface here.
    # e.g., from dronecan import make_node
    #      node = make_node('can0', node_id=125, bitrate=1000000)

    print("DroneCAN listener started. Emulating data...", flush=True)

    # Mock data generation loop
    while True:
        try:
            # In a real implementation, you would use a subscriber callback.
            # node.spin()
            
            # Mock data for demonstration
            mock_data = {
                "timestamp": time.time(),
                "source_node_id": random.randint(10, 50),
                "message_name": "uavcan.equipment.esc.Status",
                "payload": {
                    "voltage": round(random.uniform(14.0, 16.8), 2),
                    "current": round(random.uniform(5.0, 20.0), 2),
                    "rpm": random.randint(8000, 15000)
                }
            }
            
            print(json.dumps(mock_data), flush=True)
            
            time.sleep(1)

        except KeyboardInterrupt:
            print("DroneCAN listener stopped.")
            break
        except Exception as e:
            print(f"An error occurred: {e}", flush=True)
            time.sleep(5)

if __name__ == "__main__":
    main()
