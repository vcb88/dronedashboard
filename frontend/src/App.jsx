import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import './App.css'; // Keep existing CSS or replace with TailwindCSS later

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

  const ws = useRef(null);

  useEffect(() => {
    // Establish WebSocket connection
    ws.current = new WebSocket('ws://localhost:1880/ws/data');

    ws.current.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);

      setChartData((prevChartData) => {
        const newLabels = [...prevChartData.labels, new Date().toLocaleTimeString()];
        const newVoltageData = [...prevChartData.datasets[0].data, message.payload.voltage];
        const newCurrentData = [...prevChartData.datasets[1].data, message.payload.current];
        const newRPMData = [...prevChartData.datasets[2].data, message.payload.rpm];

        // Keep the last 20 data points for better visualization
        const maxDataPoints = 20;
        return {
          labels: newLabels.slice(-maxDataPoints),
          datasets: [
            { ...prevChartData.datasets[0], data: newVoltageData.slice(-maxDataPoints) },
            { ...prevChartData.datasets[1], data: newCurrentData.slice(-maxDataPoints) },
            { ...prevChartData.datasets[2], data: newRPMData.slice(-maxDataPoints) },
          ],
        };
      });
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      // Clean up WebSocket connection on component unmount
      ws.current.close();
    };
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Drone Data Real-time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    animation: false, // Disable animation for real-time updates
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Drone Dashboard</h1>
      </header>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
      <p>
        Connecting to Node-RED WebSocket at ws://localhost:1880/ws/data...
      </p>
    </div>
  );
}

export default App;