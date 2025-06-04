import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const estadosColores = {
  'Abierto': {
    bg: "rgba(25, 118, 210, 0.8)",
    border: "rgba(25, 118, 210, 1)"
  },
  'En proceso': {
    bg: "rgba(245, 124, 0, 0.8)",
    border: "rgba(245, 124, 0, 1)"
  },
  'Resuelto': {
    bg: "rgba(56, 142, 60, 0.8)",
    border: "rgba(56, 142, 60, 1)"
  },
  'Cerrado': {
    bg: "rgba(97, 97, 97, 0.8)",
    border: "rgba(97, 97, 97, 1)"
  }
};

const Report = () => {
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get("http://localhost:3001/ticket-stats");
        console.log("📊 Datos recibidos:", response.data);
        setStats(response.data);
      } catch (error) {
        console.error("❌ Error obteniendo informe:", error);
        setError(error.response?.data?.message || 'Error al cargar el informe de tickets');
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  const data = {
    labels: stats.map(s => s.estado),
    datasets: [{
      label: "Cantidad de Tickets",
      data: stats.map(s => s.cantidad),
      backgroundColor: stats.map(s => estadosColores[s.estado]?.bg || "rgba(158, 158, 158, 0.8)"),
      borderColor: stats.map(s => estadosColores[s.estado]?.border || "rgba(158, 158, 158, 1)"),
      borderWidth: 2
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#1a237e',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1a237e',
        bodyColor: '#1a237e',
        bodyFont: {
          size: 14
        },
        padding: 15,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(26, 35, 126, 0.1)'
        },
        ticks: {
          color: '#1a237e',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#1a237e',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    }
  };

  const totalTickets = stats.reduce((acc, curr) => acc + curr.cantidad, 0);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="report-container">
          <h2>📊 Informe de Estado de Tickets</h2>
          <div className="loading-message">
            <p>Cargando informe...</p>
            <small>Por favor espere mientras se generan las estadísticas</small>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="report-container">
          <h2>📊 Informe de Estado de Tickets</h2>
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              🔄 Intentar nuevamente
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="report-container">
        <h2>📊 Informe de Estado de Tickets</h2>
        
        <div className="stats-container">
          <div className="stat-card total">
            <h3>Total de Tickets</h3>
            <p>{totalTickets}</p>
          </div>
          {stats.map(stat => (
            <div 
              key={stat.estado} 
              className={`stat-card ${stat.estado.toLowerCase().replace(' ', '-')}`}
            >
              <h3>{stat.estado}</h3>
              <p>{stat.cantidad}</p>
              <div className="label">
                {totalTickets > 0 
                  ? `${((stat.cantidad / totalTickets) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
            </div>
          ))}
        </div>

        <div className="chart-container">
          {stats.length > 0 ? (
            <Bar data={data} options={options} />
          ) : (
            <div className="empty-message">
              <p>No hay datos de tickets disponibles</p>
            </div>
          )}
        </div>

        <div className="chart-js-legend">
          {stats.map((stat, index) => (
            <div key={stat.estado} className="legend-item">
              <div 
                className="legend-color" 
                style={{ 
                  backgroundColor: estadosColores[stat.estado]?.bg || "rgba(158, 158, 158, 0.8)"
                }}
              />
              {stat.estado}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Report;
