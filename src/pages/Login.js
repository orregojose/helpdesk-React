import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./style.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:3001/login", {
        email,
        password
      });

      console.log("Respuesta del servidor:", response.data);

      // Verificar que la respuesta tenga los datos necesarios
      if (response.data && response.data.usuario) {
        // Guardar los datos del usuario en sessionStorage
        sessionStorage.setItem("usuario", JSON.stringify(response.data.usuario));
        console.log("Usuario guardado en sesión");
        
        // Redirigir al dashboard
        navigate("/dashboard");
      } else {
        throw new Error("Respuesta del servidor incompleta");
      }
    } catch (error) {
      console.error("Error detallado:", error);
      setError(
        error.response?.data?.message || 
        error.message || 
        "❌ Error al iniciar sesión. Por favor, intente nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔑 Iniciar Sesión</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {isLoading ? "Iniciando sesión..." : "Ingresar"}
          </button>
          <div className="register-link">
            <a 
              onClick={() => navigate("/register")}
              style={{ 
                cursor: 'pointer', 
                marginBottom: '10px', 
                display: 'block',
                color: '#1a237e',
                textDecoration: 'none'
              }}
            >
              ¿No tiene usuario? Regístrese aquí
            </a>
            <a 
              onClick={() => navigate("/public-ticket")}
              style={{ 
                cursor: 'pointer', 
                color: '#1a237e',
                display: 'block',
                marginTop: '5px',
                textDecoration: 'none'
              }}
            >
              Crear ticket sin registro
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
