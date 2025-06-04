import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./style.css";
import Sidebar from "../components/Sidebar";
import bcrypt from "bcryptjs";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    area: "",
    empresa: "",
    password: ""
  });
  const navigate = useNavigate();

  // Verificar autenticación y cargar usuarios
  useEffect(() => {
    const usuarioGuardado = JSON.parse(sessionStorage.getItem("usuario"));
    if (!usuarioGuardado) {
      navigate("/");
    } else {
      loadUsers();
    }
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usuarioGuardado = JSON.parse(sessionStorage.getItem("usuario"));
      console.log("Usuario guardado:", usuarioGuardado);
      console.log("Iniciando petición a /get-all-users");
      const response = await axios.get("http://localhost:3001/get-all-users");
      console.log("Respuesta del servidor:", response.data);

      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
        setError(null);
      } else {
        console.log("Respuesta no válida:", response.data);
        throw new Error('La respuesta no tiene el formato esperado');
      }
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);
      
      let errorMessage = "Error al cargar los usuarios. ";
      
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
        
        switch (error.response.status) {
          case 401:
            errorMessage += "No está autorizado para ver esta información.";
            break;
          case 403:
            errorMessage += "No tiene permisos suficientes.";
            break;
          case 404:
            errorMessage += "No se encontró la ruta en el servidor.";
            break;
          case 500:
            errorMessage += "Error interno del servidor.";
            break;
          default:
            errorMessage += `Error del servidor: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage += "No se pudo conectar con el servidor. Verifique su conexión.";
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Encriptar la contraseña antes de enviarla
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(formData.password, salt);

      const dataToSend = {
        ...formData,
        password: hashedPassword
      };

      console.log("Enviando datos de registro:", { ...dataToSend, password: "ENCRYPTED" });
      const response = await axios.post("http://localhost:3001/register", dataToSend);
      console.log("Respuesta de registro:", response.data);
      
      alert("✅ Usuario registrado correctamente");
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        area: "",
        empresa: "",
        password: ""
      });
      setShowForm(false);
      loadUsers();
    } catch (error) {
      console.error("Error al registrar:", error.response || error);
      let errorMessage = "Error al registrar usuario. ";
      if (error.response) {
        errorMessage += error.response.data.message || "Por favor, intente nuevamente.";
      } else if (error.request) {
        errorMessage += "No se pudo conectar con el servidor.";
      } else {
        errorMessage += error.message;
      }
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("¿Está seguro de eliminar este usuario?")) {
      try {
        console.log("Eliminando usuario:", userId);
        const response = await axios.delete(`http://localhost:3001/delete-user/${userId}`);
        console.log("Respuesta de eliminación:", response.data);
        
        alert("✅ Usuario eliminado correctamente");
        loadUsers();
      } catch (error) {
        console.error("Error al eliminar:", error.response || error);
        let errorMessage = "Error al eliminar usuario. ";
        if (error.response) {
          errorMessage += error.response.data.message || "Por favor, intente nuevamente.";
        } else if (error.request) {
          errorMessage += "No se pudo conectar con el servidor.";
        } else {
          errorMessage += error.message;
        }
        alert(`❌ ${errorMessage}`);
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      alert("❌ Por favor ingrese la nueva contraseña");
      return;
    }

    try {
      // Encriptar la nueva contraseña antes de enviarla
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const response = await axios.put(`http://localhost:3001/reset-password/${selectedUserId}`, {
        newPassword: hashedPassword
      });
      
      alert("✅ Contraseña restablecida correctamente");
      setNewPassword("");
      setShowResetPassword(false);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
      alert("❌ Error al restablecer la contraseña");
    }
  };

  const openResetPassword = (userId) => {
    setSelectedUserId(userId);
    setShowResetPassword(true);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <h2>👥 Usuarios del Sistema</h2>
        
        <div className="table-container">
          <div className="table-header">
            <h3>Lista de Usuarios</h3>
            <button 
              className="add-user-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "❌ Cancelar" : "➕ Nuevo Usuario"}
            </button>
          </div>

          {showForm && (
            <div className="form-container">
              <h3>Nuevo Usuario</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre completo"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="area"
                    placeholder="Área o departamento"
                    value={formData.area}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="empresa"
                    placeholder="Empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <button type="submit">✅ Guardar Usuario</button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading-message">
              <p>Cargando usuarios...</p>
              <small>Por favor espere mientras se obtienen los datos</small>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={loadUsers}
              >
                🔄 Intentar nuevamente
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-message">
              <p>No hay usuarios registrados</p>
              <small>Use el botón "Nuevo Usuario" para agregar uno</small>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Área</th>
                  <th>Empresa</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.nombre}</td>
                    <td>{user.email}</td>
                    <td>{user.telefono}</td>
                    <td>{user.area}</td>
                    <td>{user.empresa}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="reset-btn"
                          onClick={() => openResetPassword(user.id)}
                        >
                          🔑 Restablecer
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(user.id)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showResetPassword && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button 
                className="modal-close"
                onClick={() => {
                  setShowResetPassword(false);
                  setSelectedUserId(null);
                  setNewPassword("");
                }}
              >
                ✖
              </button>
              <h3>Restablecer Contraseña</h3>
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit">Guardar Nueva Contraseña</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers; 