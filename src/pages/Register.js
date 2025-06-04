import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./style.css";
import Sidebar from "../components/Sidebar";

const Register = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [area, setArea] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validación básica en el frontend
    if (!nombre || !email || !telefono || !area || !empresa || !password) {
      setError("❌ Todos los campos son requeridos.");
      setIsLoading(false);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("❌ Por favor ingrese un correo electrónico válido.");
      setIsLoading(false);
      return;
    }

    // Validar longitud mínima de la contraseña
    if (password.length < 6) {
      setError("❌ La contraseña debe tener al menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/register", {
        nombre,
        email,
        telefono,
        area,
        empresa,
        password
      });

      if (response.data.success) {
        // Guardar los datos del usuario en sessionStorage
        sessionStorage.setItem("usuario", JSON.stringify(response.data.usuario));
        
        // Redirigir al dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error en registro:", error);
      
      // Mostrar el mensaje de error del servidor si existe
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else if (error.message === "Network Error") {
        setError("Error de conexión. Por favor, verifica que el servidor esté funcionando.");
      } else {
        setError("Error al registrar usuario. Por favor, intente nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = sessionStorage.getItem("usuario");

  // Si no hay usuario autenticado, mostrar el formulario de registro inicial
  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>📝 Registrar Cuenta</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleRegister}>
            <input 
              type="text" 
              placeholder="Nombre completo" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <input 
              type="tel" 
              placeholder="Teléfono" 
              value={telefono} 
              onChange={(e) => setTelefono(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <input 
              type="text" 
              placeholder="Área o departamento" 
              value={area} 
              onChange={(e) => setArea(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <input 
              type="text" 
              placeholder="Empresa" 
              value={empresa} 
              onChange={(e) => setEmpresa(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrarse"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Si hay usuario autenticado, mostrar el formulario dentro del layout con menú
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <h2>📝 Registrar Nuevo Usuario</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-container">
          <form onSubmit={handleRegister}>
            <input 
              type="text" 
              placeholder="Nombre completo" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <input 
              type="tel" 
              placeholder="Teléfono" 
              value={telefono} 
              onChange={(e) => setTelefono(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <input 
              type="text" 
              placeholder="Área o departamento" 
              value={area} 
              onChange={(e) => setArea(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <input 
              type="text" 
              placeholder="Empresa" 
              value={empresa} 
              onChange={(e) => setEmpresa(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar Usuario"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register;
