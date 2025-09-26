'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function AnalyticsChart({ data, type }) {
  const chartRef = useRef()

  const lineChartData = {
    labels: data.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Scans',
        data: data.map(item => item.count),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const doughnutChartData = {
    labels: data.map(item => item.device),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#f5f7fa',
          '#c3cfe2',
        ],
        borderWidth: 0,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${context.parsed} (${percentage}%)`
          }
        }
      },
    },
  }

  if (type === 'line') {
    return (
      <div style={{ height: '300px' }}>
        <Line ref={chartRef} data={lineChartData} options={lineOptions} />
      </div>
    )
  }

  if (type === 'doughnut') {
    return (
      <div style={{ height: '300px' }}>
        <Doughnut ref={chartRef} data={doughnutChartData} options={doughnutOptions} />
      </div>
    )
  }

  return <div>Unsupported chart type</div>
}