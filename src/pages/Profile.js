import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Profile = () => {
  const [usuario, setUsuario] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Función para cargar los datos del usuario
  const cargarDatosUsuario = useCallback(async () => {
    const usuarioGuardado = JSON.parse(sessionStorage.getItem("usuario"));
    
    if (!usuarioGuardado || !usuarioGuardado.id) {
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3001/user/${usuarioGuardado.id}`);
      const datosUsuario = {
        ...response.data,
        id: usuarioGuardado.id
      };
      setUsuario(datosUsuario);
      setFormData(datosUsuario);
    } catch (error) {
      console.error("❌ Error cargando perfil:", error);
      alert("❌ Error al cargar el perfil. Por favor, recargue la página.");
    }
  }, [navigate]);

  useEffect(() => {
    cargarDatosUsuario();
  }, [cargarDatosUsuario]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!usuario || !usuario.id) {
        throw new Error("No se pudo identificar el usuario");
      }

      const datosActualizacion = {
        id: usuario.id,
        nombre: formData.nombre,
        telefono: formData.telefono,
        empresa: formData.empresa,
        area: formData.area
      };

      const response = await axios.put("http://localhost:3001/update-user", datosActualizacion);

      // Actualizar sessionStorage con los datos del formulario
      const usuarioGuardado = JSON.parse(sessionStorage.getItem("usuario"));
      const datosActualizados = {
        ...usuarioGuardado,
        nombre: formData.nombre,
        telefono: formData.telefono,
        empresa: formData.empresa,
        area: formData.area
      };
      sessionStorage.setItem("usuario", JSON.stringify(datosActualizados));

      // Actualizar estado local y recargar datos
      setEditMode(false);
      await cargarDatosUsuario(); // Recargar datos frescos del servidor
      alert("✅ Perfil actualizado correctamente");
    } catch (error) {
      console.error("❌ Error en la actualización:", error);
      // Solo mostrar alerta si realmente hay un error en la petición
      if (!error.response || error.response.status !== 200) {
        alert("❌ Error: " + (error.response?.data?.error || error.message || "Error al actualizar el perfil"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="profile-container">
        <h2>🙍‍♂️ Mi Perfil</h2>
        {isLoading ? (
          <div className="loading-message">
            <p>Actualizando perfil...</p>
          </div>
        ) : usuario && !editMode ? (
          <div className="profile-card">
            <p><strong>Nombre:</strong> {usuario.nombre}</p>
            <p><strong>Correo:</strong> {usuario.email}</p>
            <p><strong>Teléfono:</strong> {usuario.telefono}</p>
            <p><strong>Empresa:</strong> {usuario.empresa}</p>
            <p><strong>Área:</strong> {usuario.area}</p>
            <button onClick={() => setEditMode(true)} disabled={isLoading}>
              <span>✏️</span>
              Editar Perfil
            </button>
          </div>
        ) : (
          <form className="profile-form" onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Nombre:</label>
              <input 
                type="text" 
                value={formData.nombre || ''} 
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Correo:</label>
              <input 
                type="email" 
                value={formData.email || ''} 
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>
            <div className="form-group">
              <label>Teléfono:</label>
              <input 
                type="tel" 
                value={formData.telefono || ''} 
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Empresa:</label>
              <input 
                type="text" 
                value={formData.empresa || ''} 
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Área:</label>
              <input 
                type="text" 
                value={formData.area || ''} 
                onChange={(e) => setFormData({ ...formData, area: e.target.value })} 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="buttons-container">
              <button type="submit" disabled={isLoading}>
                <span>✅</span>
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button 
                type="button" 
                onClick={() => setEditMode(false)} 
                disabled={isLoading}
              >
                <span>❌</span>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default Profile;
