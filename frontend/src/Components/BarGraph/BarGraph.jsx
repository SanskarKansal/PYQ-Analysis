import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import the plugin

// Register required components including the plugin
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const Graph = () => {
  // Topic frequency data
  const topicFrequency = [
    { topic: "CPU Scheduling", frequency: 3 },
    { topic: "Deadlock", frequency: 2 },
    { topic: "Memory Management", frequency: 3 },
    { topic: "Security", frequency: 2 },
    { topic: "Synchronization", frequency: 4 },
    { topic: "Multithreading", frequency: 3 },
    { topic: "Distributed Systems", frequency: 1 },
    { topic: "Resource Allocation", frequency: 1 },
    { topic: "Storage Management", frequency: 1 },
    { topic: "System Programming", frequency: 1 }
  ];

  // Calculate total frequency
  const totalFrequency = topicFrequency.reduce((acc, item) => acc + item.frequency, 0);

  // Extract topics, frequencies, and calculate percentages
  const labels = topicFrequency.map(item => item.topic);
  const dataValues = topicFrequency.map(item => item.frequency);
  const percentages = topicFrequency.map(item => ((item.frequency / totalFrequency) * 100).toFixed(2));

  const backgroundColors = [
    "rgba(255, 99, 132, 0.8)", 
    "rgba(54, 162, 235, 0.8)", 
    "rgba(255, 206, 86, 0.8)", 
    "rgba(75, 192, 192, 0.8)", 
    "rgba(153, 102, 255, 0.8)", 
    "rgba(255, 159, 64, 0.8)", 
    "rgba(255, 99, 132, 0.8)", 
    "rgba(54, 162, 235, 0.8)", 
    "rgba(255, 206, 86, 0.8)", 
    "rgba(75, 192, 192, 0.8)"
  ];

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Topic Frequency",
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: "rgba(255, 255, 255, 0.2)", // Light border for dark theme
        borderWidth: 1,
        datalabels: {
          // Display the percentage on top of each bar
          color: '#ffffff',
          formatter: (value, context) => `${percentages[context.dataIndex]}%`,
          anchor: 'end',
          align: 'top',
          font: {
            weight: 'bold',
            size: 12,
          },
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend box and label
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const topic = labels[tooltipItem.dataIndex];
            const percentage = percentages[tooltipItem.dataIndex];
            return `${topic}: ${tooltipItem.raw} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...dataValues)+1, 
        ticks: {
          color: "#ffffff", // White labels for dark theme
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)", // Subtle white grid lines
        },
      },
      x: {
        ticks: {
          color: "#ffffff", // White labels for dark theme
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)", // Subtle white grid lines
        },
      },
    },
  };

  return (
    <div className="bg-[#2A2A3A] p-6 my-6 w-full max-w-lg shadow-lg rounded-lg border border-[#3B3B4F]">
      <h2 className="text-xl font-bold text-center text-gray-200 mb-4">📊 Topic Frequency</h2>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default Graph;
