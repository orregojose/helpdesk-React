import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./style.css";
import Sidebar from "../components/Sidebar";

const ConsultTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const navigate = useNavigate();
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));

  useEffect(() => {
    axios.get("http://localhost:3001/tickets", {
      headers: {
        'user-id': usuario.id
      }
    })
      .then((response) => {
        // Si es usuario normal, filtrar solo sus tickets
        const allTickets = response.data;
        const userTickets = usuario.rol === "normal" 
          ? allTickets.filter(ticket => ticket.usuario_id === usuario.id)
          : allTickets;
        
        setTickets(userTickets);
        setFilteredTickets(userTickets);
      })
      .catch((error) => console.error("❌ Error obteniendo tickets:", error));
  }, [usuario.id, usuario.rol]);

  useEffect(() => {
    if (estadoFiltro === "Todos") {
      setFilteredTickets(tickets);
    } else {
      setFilteredTickets(tickets.filter(ticket => ticket.estado === estadoFiltro));
    }
  }, [estadoFiltro, tickets]);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await axios.put("http://localhost:3001/update-ticket", 
        { id, estado: nuevoEstado },
        { headers: { 'user-id': usuario.id } }
      );
      
      const ticketsActualizados = tickets.map(ticket => 
        ticket.id === id ? { ...ticket, estado: nuevoEstado } : ticket
      );
      setTickets(ticketsActualizados);
      setFilteredTickets(
        estadoFiltro === "Todos" 
          ? ticketsActualizados 
          : ticketsActualizados.filter(ticket => ticket.estado === estadoFiltro)
      );
    } catch (error) {
      console.error("❌ Error actualizando ticket:", error);
      alert(error.response?.data?.message || "Error al actualizar el estado del ticket");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <h2>🔎 {usuario.rol === "normal" ? "Mis Tickets" : "Consultar Tickets"}</h2>
        <div className="filter-container">
          <label htmlFor="estadoFiltro">Filtrar por estado:</label>
          <select 
            id="estadoFiltro"
            value={estadoFiltro} 
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="filter-select"
          >
            <option value="Todos">Todos</option>
            <option value="Abierto">Abierto</option>
            <option value="En proceso">En proceso</option>
            <option value="Resuelto">Resuelto</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Creado por</th>
                <th>Email</th>
                <th># Ticket</th>
                <th>Fecha de creación</th>
                {(usuario.rol === "administrador" || usuario.rol === "soporte") && (
                  <th>Acción</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} onClick={() => navigate(`/ticket/${ticket.id}`)}>
                  <td>{ticket.id}</td>
                  <td>{ticket.titulo}</td>
                  <td>{ticket.estado}</td>
                  <td>{ticket.creador}</td>
                  <td>{ticket.email_creador}</td>
                  <td>{ticket.ticket_number || 'N/A'}</td>
                  <td>{new Date(ticket.fecha_creacion).toLocaleString()}</td>
                  {(usuario.rol === "administrador" || usuario.rol === "soporte") && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <select 
                        value={ticket.estado} 
                        onChange={(e) => actualizarEstado(ticket.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="Abierto">Abierto</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Resuelto">Resuelto</option>
                        <option value="Cerrado">Cerrado</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ConsultTickets;
