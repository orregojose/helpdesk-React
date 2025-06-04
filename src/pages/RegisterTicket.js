import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./style.css";
import Sidebar from "../components/Sidebar";

const RegisterTicket = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));

  // Redirigir si no hay usuario autenticado
  if (!usuario) {
    navigate("/");
    return null;
  }

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:3001/register-ticket", {
        usuario_id: usuario.id,
        titulo,
        descripcion
      });

      if (response.data.success) {
        alert("✅ " + response.data.message);
        navigate("/consultar-tickets");
      } else {
        setError(response.data.message || "Error al crear el ticket");
      }
    } catch (error) {
      console.error("❌ Error registrando ticket:", error);
      setError(error.response?.data?.message || "Error al crear el ticket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <h2>🎫 Registrar Nuevo Ticket</h2>
        <div className="form-container">
          <h3>Nuevo Ticket de Soporte</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleTicketSubmit}>
            <div className="form-group">
              <label htmlFor="titulo">Título del Problema</label>
              <input 
                type="text" 
                id="titulo"
                placeholder="Ej: Error al iniciar sesión" 
                value={titulo} 
                onChange={(e) => setTitulo(e.target.value)} 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="descripcion">Descripción Detallada</label>
              <textarea 
                id="descripcion"
                placeholder="Describe el problema detalladamente..." 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)} 
                required
                rows="6"
                disabled={isLoading}
              ></textarea>
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Enviando..." : "✉️ Enviar Ticket"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegisterTicket;
