import React from "react";
import { useNavigate } from "react-router-dom";
import trilogitLogo from "../assets/trilogit-logo.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));

  const handleLogout = () => {
    sessionStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h3>📌 MESA DE AYUDA</h3>
        <ul>
          <li onClick={() => navigate("/dashboard")}>🏠 Inicio</li>
          <li onClick={() => navigate("/profile")}>🙍‍♂️ Mi Perfil</li>
          <li onClick={() => navigate("/register-ticket")}>📝 Registrar Ticket</li>
          <li onClick={() => navigate("/consultar-tickets")}>
            {usuario?.rol === "normal" ? "🔎 Mis Tickets" : "🔎 Consultar Tickets"}
          </li>
          {(usuario?.rol === "administrador" || usuario?.rol === "soporte") && (
            <li onClick={() => navigate("/report")}>📊 Informe de Tickets</li>
          )}
          {usuario?.rol === "administrador" && (
            <li onClick={() => navigate("/users")}>👥 Usuarios</li>
          )}
          <li onClick={handleLogout}>🚪 Cerrar Sesión</li>
        </ul>
      </div>
      <div className="sidebar-logo">
        <img src={trilogitLogo} alt="TRILOGIT Logo" />
      </div>
    </aside>
  );
};

export default Sidebar; 