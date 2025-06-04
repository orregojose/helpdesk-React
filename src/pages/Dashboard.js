import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "./style.css";

const Dashboard = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userInfo = sessionStorage.getItem("usuario");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserName(user.nombre);
    }
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <h2>🚀 Bienvenido{userName ? `, ${userName}` : ""}</h2>
        <p>Aquí puedes gestionar tus tickets y recibir asistencia.</p>
      </main>
    </div>
  );
};

export default Dashboard;
