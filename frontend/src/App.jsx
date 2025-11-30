import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library
// Import default Leaflet icon images for the fix
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
// Import custom drone icon
import droneIcon from './assets/drone-icon.png'; // Placeholder: User needs to provide this file

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css';

// Fix for Leaflet default icon issue with Webpack/Vite
// This ensures default Leaflet markers work if custom ones are not used or fail
delete L.Icon.Default.prototype._getIconUrl; // Remove the default icon URL getter
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

// Define custom drone icon
const customDroneIcon = L.icon({
  iconUrl: droneIcon,
  iconSize: [32, 32], // size of the icon
  iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -16] // point from which the popup should open relative to the iconAnchor
});

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MAX_DATA_POINTS = 50;
const MOSCOW_COORDS = [55.7558, 37.6176];

// A component to automatically update the map's view
function ChangeView({ center }) { // Removed zoom prop
  const map = useMap();
  useEffect(() => {
    // A small delay is sometimes needed for the map to initialize its size correctly.
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    map.setView(center, map.getZoom()); // Use current map zoom

    return () => clearTimeout(timer);
  }, [center, map]); // Removed zoom from dependency array

  return null;
}

function App() {
  const [escData, setEscData] = useState({
    labels: [],
    datasets: [
      { label: 'Voltage (V)', data: [], borderColor: 'rgb(75, 192, 192)', tension: 0.1, yAxisID: 'y' },
      { label: 'Current (A)', data: [], borderColor: 'rgb(255, 99, 132)', tension: 0.1, yAxisID: 'y' },
      { label: 'RPM', data: [], borderColor: 'rgb(53, 162, 235)', tension: 0.1, yAxisID: 'y1' },
    ],
  });

  const [telemetryData, setTelemetryData] = useState({
    labels: [],
    datasets: [
      { label: 'Altitude (m)', data: [], borderColor: 'rgb(255, 159, 64)', tension: 0.1 },
      { label: 'Speed (m/s)', data: [], borderColor: 'rgb(153, 102, 255)', tension: 0.1 },
    ],
  });

  const [position, setPosition] = useState(MOSCOW_COORDS);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connection opened');
      setConnectionStatus('Connected');
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
      setConnectionStatus('Disconnected');
      reconnectTimeout.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connectWebSocket();
      }, 5000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error');
    };

    ws.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const timestamp = payload.timestamp 
          ? new Date(payload.timestamp * 1000).toLocaleTimeString() 
          : new Date().toLocaleTimeString();

        if (payload.voltage !== undefined && payload.current !== undefined) {
          setEscData((prev) => ({
            labels: [...prev.labels, timestamp].slice(-MAX_DATA_POINTS),
            datasets: [
              { ...prev.datasets[0], data: [...prev.datasets[0].data, payload.voltage].slice(-MAX_DATA_POINTS) },
              { ...prev.datasets[1], data: [...prev.datasets[1].data, payload.current].slice(-MAX_DATA_POINTS) },
              { ...prev.datasets[2], data: [...prev.datasets[2].data, payload.rpm || 0].slice(-MAX_DATA_POINTS) },
            ],
          }));
        } else if (payload.latitude !== undefined && payload.longitude !== undefined) {
          setPosition([payload.latitude, payload.longitude]);
          setTelemetryData((prev) => ({
            labels: [...prev.labels, timestamp].slice(-MAX_DATA_POINTS),
            datasets: [
              { ...prev.datasets[0], data: [...prev.datasets[0].data, payload.altitude_relative || 0].slice(-MAX_DATA_POINTS) },
              { ...prev.datasets[1], data: [...prev.datasets[1].data, payload.speed || 0].slice(-MAX_DATA_POINTS) },
            ],
          }));
        }
      } catch (e) {
        console.error("Failed to parse incoming WebSocket message:", event.data, e);
      }
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) ws.current.close();
    };
  }, []);

  const escOptions = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'ESC Data' } },
    scales: { 
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Voltage / Current' } },
      y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'RPM' }, grid: { drawOnChartArea: false } },
      x: { title: { display: true, text: 'Time' } }
    },
  };

  const telemetryOptions = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Telemetry' } },
    scales: { y: { beginAtZero: false, title: { display: true, text: 'Value' } }, x: { title: { display: true, text: 'Time' } } },
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Drone Dashboard</h1>
        <span className={`status ${connectionStatus.toLowerCase()}`}>
          Status: {connectionStatus}
        </span>
      </header>
      <div className="main-content">
        <div className="chart-wrapper">
          <div className="chart-container">
            <Line data={escData} options={escOptions} />
          </div>
          <div className="chart-container">
            <Line data={telemetryData} options={telemetryOptions} />
          </div>
        </div>
        <div className="map-container">
          <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{height: "100%", width: "100%"}}>
            <ChangeView center={position} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={customDroneIcon}>
              <Popup>Drone Location</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default App;