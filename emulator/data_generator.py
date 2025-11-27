import json
import time
import math
import random

# --- Configuration ---
START_LAT = 55.7558  # Moscow, Red Square
START_LON = 37.6176
METERS_PER_DEGREE_LAT = 111320
METERS_PER_DEGREE_LON = METERS_PER_DEGREE_LAT * math.cos(math.radians(START_LAT))

# --- Helper Functions ---
def get_location_offset(lat, lon, dn, de):
    """Calculate new lat/lon from north/east meter offsets."""
    d_lat = dn / METERS_PER_DEGREE_LAT
    d_lon = de / METERS_PER_DEGREE_LON
    return lat + d_lat, lon + d_lon

def generate_telemetry(timestamp, state):
    """Generate a single telemetry snapshot with some noise."""
    return {
        "timestamp": int(timestamp),
        "flight_mode": state.get("flight_mode", "UNKNOWN"),
        "armed": state.get("armed", False),
        "latitude": state.get("lat", START_LAT) + random.uniform(-0.000001, 0.000001),
        "longitude": state.get("lon", START_LON) + random.uniform(-0.000001, 0.000001),
        "altitude_relative": max(0, state.get("alt", 0) + random.uniform(-0.1, 0.1)),
        "heading": state.get("heading", 0) % 360,
        "speed": max(0, state.get("speed", 0) + random.uniform(-0.2, 0.2)),
        "roll": state.get("roll", 0) + random.uniform(-0.5, 0.5),
        "pitch": state.get("pitch", 0) + random.uniform(-0.5, 0.5),
        "battery_voltage": max(13.0, state.get("voltage", 16.8) - random.uniform(0.0, 0.01)),
        "battery_current": max(0, state.get("current", 0) + random.uniform(-0.5, 0.5)),
        "battery_remaining_percent": max(0, state.get("battery_percent", 100)),
        "gps_fix_type": 6,  # RTK Fixed
        "gps_satellites_visible": 18
    }

# --- Mission Simulators ---
def simulate_survey_mission(start_timestamp):
    """Simulates a lawnmower grid survey flight."""
    print("Simulating Mission 1: Survey Flight...")
    telemetry_points = []
    state = {
        "lat": START_LAT, "lon": START_LON, "alt": 0, "speed": 0,
        "heading": 0, "roll": 0, "pitch": 0, "armed": False,
        "voltage": 16.8, "current": 1, "battery_percent": 100
    }
    
    # Takeoff
    state["armed"] = True
    state["flight_mode"] = "TAKEOFF"
    for t in range(20):
        state["alt"] += 1  # 1 m/s climb
        state["current"] = 20
        state["battery_percent"] -= 0.05
        telemetry_points.append(generate_telemetry(start_timestamp + t, state))
    
    # Mission
    state["flight_mode"] = "MISSION"
    state["speed"] = 10
    state["current"] = 15
    
    waypoints = [
        (100, 0), (100, 20), (0, 20), (0, 40), (100, 40), (100, 60), (0, 60)
    ]
    
    current_time = start_timestamp + 20
    for i, (n, e) in enumerate(waypoints):
        target_lat, target_lon = get_location_offset(START_LAT, START_LON, n, e)
        state["heading"] = (math.degrees(math.atan2(e - state["lon"], n - state["lat"])) + 360) % 360
        
        # Fly to waypoint
        for _ in range(10): # 10 seconds per leg
            state["lat"] += (target_lat - state["lat"]) * 0.1
            state["lon"] += (target_lon - state["lon"]) * 0.1
            state["battery_percent"] -= 0.03
            telemetry_points.append(generate_telemetry(current_time, state))
            current_time += 1

    # Return to Home & Land
    state["flight_mode"] = "RTL"
    state["speed"] = 5
    for _ in range(20):
        state["lat"] += (START_LAT - state["lat"]) * 0.1
        state["lon"] += (START_LON - state["lon"]) * 0.1
        state["battery_percent"] -= 0.02
        telemetry_points.append(generate_telemetry(current_time, state))
        current_time += 1

    state["flight_mode"] = "LAND"
    for t in range(20):
        state["alt"] = max(0, state["alt"] - 1)
        state["current"] = 5
        state["battery_percent"] -= 0.01
        telemetry_points.append(generate_telemetry(current_time + t, state))

    state["armed"] = False
    return telemetry_points

def simulate_dynamic_mission(start_timestamp):
    """Simulates a dynamic flight with aggressive maneuvers."""
    print("Simulating Mission 2: Dynamic Test...")
    telemetry_points = []
    state = {
        "lat": START_LAT, "lon": START_LON, "alt": 0, "speed": 0,
        "heading": 90, "roll": 0, "pitch": 0, "armed": False,
        "voltage": 16.8, "current": 1, "battery_percent": 100
    }
    
    # Takeoff
    state["armed"] = True
    state["flight_mode"] = "STABILIZED"
    current_time = start_timestamp
    for _ in range(10):
        state["alt"] += 2
        state["current"] = 25
        state["battery_percent"] -= 0.08
        telemetry_points.append(generate_telemetry(current_time, state))
        current_time += 1
    
    # Maneuver 1: Hard Turn
    state["speed"] = 15
    for _ in range(15):
        state["roll"] = -30
        state["heading"] = (state["heading"] - 6) % 360
        state["current"] = 35
        state["battery_percent"] -= 0.1
        telemetry_points.append(generate_telemetry(current_time, state))
        current_time += 1
    state["roll"] = 0

    # Maneuver 2: Rapid Climb
    for _ in range(10):
        state["alt"] += 5
        state["pitch"] = -15
        state["current"] = 45
        state["battery_percent"] -= 0.15
        telemetry_points.append(generate_telemetry(current_time, state))
        current_time += 1
    state["pitch"] = 0

    # Hover
    state["speed"] = 0
    for _ in range(20):
        state["current"] = 10
        state["battery_percent"] -= 0.02
        telemetry_points.append(generate_telemetry(current_time, state))
        current_time += 1
        
    # Land
    state["flight_mode"] = "LAND"
    for _ in range(30):
        state["alt"] = max(0, state["alt"] - (state["alt"] * 0.2))
        state["current"] = 5
        state["battery_percent"] -= 0.01
        telemetry_points.append(generate_telemetry(current_time, state))
        current_time += 1
    
    state["armed"] = False
    return telemetry_points

# --- Main Execution ---
def main():
    """Main function to generate all missions and write to a file."""
    output_filename = "mission_data.jsonl"
    
    start_time = time.time()
    
    mission1_data = simulate_survey_mission(start_time)
    # Add a time gap between missions
    mission2_start_time = mission1_data[-1]["timestamp"] + 120
    mission2_data = simulate_dynamic_mission(mission2_start_time)
    
    all_data = mission1_data + mission2_data
    
    with open(output_filename, "w") as f:
        for point in all_data:
            f.write(json.dumps(point) + "\n")
            
    print(f"\nSuccessfully generated {len(all_data)} telemetry points.")
    print(f"Data written to '{output_filename}'.")

if __name__ == "__main__":
    main()
