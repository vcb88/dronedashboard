import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import './App.css';

function App() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Voltage',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Current',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'RPM',
        data: [],
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.1,
      },
    ],
  });
  const [logFiles, setLogFiles] = useState([]);
  const [currentMode, setCurrentMode] = useState('Live'); // 'Live' or 'Replay'
  const ws = useRef(null);

  // Function to clear chart data
  const clearChart = () => {
    setChartData({
      labels: [],
      datasets: [
        { ...chartData.datasets[0], data: [] },
        { ...chartData.datasets[1], data: [] },
        { ...chartData.datasets[2], data: [] },
      ],
    });
  };

  // Effect for fetching log files
  useEffect(() => {
    fetch('/api/logs')
      .then(response => response.json())
      .then(data => setLogFiles(data))
      .catch(error => console.error('Error fetching log files:', error));
  }, []);

  // Effect for WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:1880/ws/data');
    ws.current.onopen = () => console.log('WebSocket connection opened');
    ws.current.onclose = () => console.log('WebSocket connection closed');
    ws.current.onerror = (error) => console.error('WebSocket error:', error);

    ws.current.onmessage = (event) => {
      try {
        const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        const payload = message.payload ? message.payload : message;

        if (payload.voltage === undefined || payload.current === undefined) {
          console.warn("Received message without expected payload:", payload);
          return;
        }

        setChartData((prevChartData) => {
          const newLabels = [...prevChartData.labels, new Date(payload.timestamp * 1000).toLocaleTimeString()];
          const newVoltageData = [...prevChartData.datasets[0].data, payload.voltage];
          const newCurrentData = [...prevChartData.datasets[1].data, payload.current];
          const newRPMData = payload.rpm ? [...prevChartData.datasets[2].data, payload.rpm] : [...prevChartData.datasets[2].data, 0];

          const maxDataPoints = 50; // Increased for better replay view
          return {
            labels: newLabels.slice(-maxDataPoints),
            datasets: [
              { ...prevChartData.datasets[0], data: newVoltageData.slice(-maxDataPoints) },
              { ...prevChartData.datasets[1], data: newCurrentData.slice(-maxDataPoints) },
              { ...prevChartData.datasets[2], data: newRPMData.slice(-maxDataPoints) },
            ],
          };
        });
      } catch (e) {
        console.error("Failed to parse incoming WebSocket message:", event.data, e);
      }
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const handleReplayClick = (file) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      clearChart();
      setCurrentMode(`Replay: ${file}`);
      const command = {
        action: 'replay',
        file: `/data/logs/${file}`, // Send the full path for Node-RED
      };
      ws.current.send(JSON.stringify(command));
      console.log(`Sent replay command for file: ${file}`);
    } else {
      console.error('WebSocket is not open.');
    }
  };
  
  const handleLiveClick = () => {
      clearChart();
      setCurrentMode('Live');
      // The backend will automatically send live data if no replay is active.
      // We could send a "stop_replay" command if we wanted to be more explicit.
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Drone Data - ${currentMode} Mode` },
    },
    scales: { y: { beginAtZero: false } },
    animation: false,
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Drone Dashboard</h1>
      </header>
      <div className="main-content">
        <div className="chart-container">
          <Line data={chartData} options={options} />
        </div>
        <div className="logs-container">
          <h2>Controls</h2>
          <button onClick={handleLiveClick} disabled={currentMode === 'Live'}>
            Go Live
          </button>
          <h3>Archived Logs</h3>
          {logFiles.length > 0 ? (
            <ul>
              {logFiles.map((file, index) => (
                <li key={index}>
                  <button onClick={() => handleReplayClick(file)}>
                    Replay: {file}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No log files found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;