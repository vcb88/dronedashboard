import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    // A small delay is sometimes needed for the map to initialize its size correctly.
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    map.setView(center, zoom);

    return () => clearTimeout(timer);
  }, [center, zoom, map]);

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
        <div className="sidebar">
          <div className="map-container">
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{height: "100%", width: "100%"}}>
              <ChangeView center={position} zoom={14} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>Drone Location</Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="logs-container">
            <h2>Controls</h2>
            <p>Live data is always active.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;