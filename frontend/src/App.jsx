import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
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

function App() {
  const [escData, setEscData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Voltage (V)',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: 'Current (A)',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: 'RPM',
        data: [],
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  });

  const [telemetryData, setTelemetryData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Altitude (m)',
        data: [],
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1,
      },
      {
        label: 'Speed (m/s)',
        data: [],
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1,
      },
    ],
  });

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

        // Check if it's ESC data
        if (payload.voltage !== undefined && payload.current !== undefined) {
          setEscData((prevData) => {
            const newLabels = [...prevData.labels, timestamp].slice(-MAX_DATA_POINTS);
            return {
              labels: newLabels,
              datasets: [
                { ...prevData.datasets[0], data: [...prevData.datasets[0].data, payload.voltage].slice(-MAX_DATA_POINTS) },
                { ...prevData.datasets[1], data: [...prevData.datasets[1].data, payload.current].slice(-MAX_DATA_POINTS) },
                { ...prevData.datasets[2], data: [...prevData.datasets[2].data, payload.rpm || 0].slice(-MAX_DATA_POINTS) },
              ],
            };
          });
        } 
        // Check if it's Telemetry data
        else if (payload.flight_mode !== undefined && payload.altitude_relative !== undefined) {
          setTelemetryData((prevData) => {
            const newLabels = [...prevData.labels, timestamp].slice(-MAX_DATA_POINTS);
            return {
              labels: newLabels,
              datasets: [
                { ...prevData.datasets[0], data: [...prevData.datasets[0].data, payload.altitude_relative].slice(-MAX_DATA_POINTS) },
                { ...prevData.datasets[1], data: [...prevData.datasets[1].data, payload.speed || 0].slice(-MAX_DATA_POINTS) },
              ],
            };
          });
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
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'ESC Data (Live)' },
    },
    scales: { 
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Voltage (V) / Current (A)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'RPM' },
        grid: { drawOnChartArea: false },
      },
      x: {
        title: { display: true, text: 'Time' }
      }
    },
    animation: false,
  };

  const telemetryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Telemetry Data (Live)' },
    },
    scales: { 
      y: { 
        beginAtZero: false,
        title: { display: true, text: 'Value' }
      },
      x: {
        title: { display: true, text: 'Time' }
      }
    },
    animation: false,
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
        <div className="logs-container">
          <h2>Controls</h2>
          <p>Live data is always active.</p>
          <h3>Archived Logs (Disabled)</h3>
        </div>
      </div>
    </div>
  );
}

export default App;
