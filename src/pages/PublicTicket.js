import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './style.css';

const PublicTicket = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        titulo: '',
        descripcion: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [ticketNumber, setTicketNumber] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3001/public-ticket', formData);
            
            if (response.data.success) {
                setTicketNumber(response.data.ticketNumber);
                setFormData({
                    nombre: '',
                    email: '',
                    titulo: '',
                    descripcion: '',
                    password: ''
                });
                // Si el usuario fue creado exitosamente, redirigir al login
                if (response.data.userCreated) {
                    setTimeout(() => {
                        navigate('/');
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Error al crear ticket:', error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.message === 'Network Error') {
                setError('Error de conexión. Por favor, verifica que el servidor esté funcionando.');
            } else {
                setError('Error al crear el ticket. Por favor, intente nuevamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar mensaje de error cuando el usuario empiece a escribir
        if (error) setError('');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>📝 Crear Ticket de Soporte</h2>
                {error && <div className="error-message">{error}</div>}
                {ticketNumber && (
                    <div className="success-message">
                        <p>✅ Ticket creado exitosamente</p>
                        <p>Número de ticket: {ticketNumber}</p>
                        <p>Se ha creado una cuenta con su correo electrónico.</p>
                        <p>Será redirigido al inicio de sesión en unos segundos...</p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre completo"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Correo electrónico"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Crear contraseña"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        minLength="6"
                    />
                    <input
                        type="text"
                        name="titulo"
                        placeholder="Título del ticket"
                        value={formData.titulo}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                    <textarea
                        name="descripcion"
                        placeholder="Descripción detallada del problema"
                        value={formData.descripcion}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        rows="4"
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Creando ticket..." : "Crear Ticket"}
                    </button>
                    <div className="login-link">
                        <p>¿Ya tiene una cuenta?</p>
                        <button 
                            type="button" 
                            className="login-btn"
                            onClick={() => navigate('/')}
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PublicTicket; 