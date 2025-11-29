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
  // const [logFiles, setLogFiles] = useState([]); // Replay functionality disabled
  const [currentMode, setCurrentMode] = useState('Live');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

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

  // // Effect for fetching log files (Replay functionality disabled)
  // useEffect(() => {
  //   const fetchLogs = () => {
  //     fetch('/api/logs')
  //       .then(response => {
  //         if (!response.ok) throw new Error(`HTTP ${response.status}`);
  //         return response.json();
  //       })
  //       .then(data => {
  //         console.log('Fetched log files:', data);
  //         setLogFiles(data);
  //       })
  //       .catch(error => console.error('Error fetching log files:', error));
  //   };

  //   fetchLogs();
  //   const interval = setInterval(fetchLogs, 30000); // Refresh every 30s
  //   return () => clearInterval(interval);
  // }, []);

  // WebSocket connection with auto-reconnect
  const connectWebSocket = () => {
    // Dynamic WebSocket URL based on current window location
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
      // Auto-reconnect after 5 seconds
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
        
        console.log('Received payload:', payload);

        // Check if payload has required fields
        if (payload.voltage === undefined || payload.current === undefined) {
          console.warn("Received message without expected fields:", payload);
          return;
        }

        setChartData((prevChartData) => {
          const timestamp = payload.timestamp 
            ? new Date(payload.timestamp * 1000).toLocaleTimeString() 
            : new Date().toLocaleTimeString();
          
          const newLabels = [...prevChartData.labels, timestamp];
          const newVoltageData = [...prevChartData.datasets[0].data, payload.voltage];
          const newCurrentData = [...prevChartData.datasets[1].data, payload.current];
          const newRPMData = [...prevChartData.datasets[2].data, payload.rpm || 0];

          const maxDataPoints = 50;
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
  };

  // Effect for WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Replay functionality is disabled for now
  // const handleReplayClick = (file) => {
  //   if (ws.current && ws.current.readyState === WebSocket.OPEN) {
  //     clearChart();
  //     setCurrentMode(`Replay: ${file}`);
  //     const command = {
  //       action: 'replay',
  //       file: `/data/logs/${file}`,
  //     };
  //     ws.current.send(JSON.stringify(command));
  //     console.log(`Sent replay command for file: ${file}`);
  //   } else {
  //     console.error('WebSocket is not open. Status:', connectionStatus);
  //     alert('WebSocket connection is not available. Please wait for reconnection.');
  //   }
  // };
  
  const handleLiveClick = () => {
    clearChart();
    setCurrentMode('Live');
    console.log('Switched to Live mode');
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Drone Data - ${currentMode} Mode` },
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
        <div className="chart-container">
          <Line data={chartData} options={options} />
        </div>
        <div className="logs-container">
          <h2>Controls</h2>
          <button 
            onClick={handleLiveClick} 
            disabled={currentMode === 'Live' || connectionStatus !== 'Connected'}
            className="live-button"
          >
            🔴 Go Live
          </button>
          <h3>Archived Logs (Disabled)</h3>
          {/* Replay functionality disabled
          {logFiles.length > 0 ? (
            <ul>
              {logFiles.map((file, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleReplayClick(file)}
                    disabled={connectionStatus !== 'Connected'}
                  >
                    ▶️ Replay: {file}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No log files found.</p>
          )}
          */}
        </div>
      </div>
    </div>
  );
}

export default App;