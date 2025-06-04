import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './style.css';

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actualizandoEstado, setActualizandoEstado] = useState(false);
    
    // Obtener el usuario del sessionStorage
    const usuario = JSON.parse(sessionStorage.getItem('usuario'));

    // Verificar si hay usuario y redirigir si no
    useEffect(() => {
        if (!usuario) {
            navigate('/login');
            return;
        }
    }, [usuario, navigate]);

    useEffect(() => {
        cargarTicket();
    }, [id]);

    const cargarTicket = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/ticket/${id}`, {
                headers: {
                    'user-id': usuario?.id
                }
            });
            setTicket(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al cargar el ticket:', error);
            setError('Error al cargar los detalles del ticket');
            setIsLoading(false);
        }
    };

    const agregarComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;

        try {
            await axios.post(`http://localhost:3001/ticket/${id}/comentario`, {
                usuario_id: usuario.id,
                contenido: nuevoComentario
            }, {
                headers: {
                    'user-id': usuario.id
                }
            });

            // Recargar el ticket para obtener los comentarios actualizados
            await cargarTicket();
            setNuevoComentario('');
        } catch (error) {
            console.error('Error al agregar comentario:', error);
            setError('Error al agregar el comentario');
        }
    };

    const cambiarEstado = async (nuevoEstado) => {
        try {
            setActualizandoEstado(true);
            await axios.put(`http://localhost:3001/update-ticket`, {
                id: ticket.id,
                estado: nuevoEstado
            }, {
                headers: {
                    'user-id': usuario.id
                }
            });
            await cargarTicket(); // Recargar el ticket para mostrar el nuevo estado
            setActualizandoEstado(false);
        } catch (error) {
            console.error('Error al actualizar el estado:', error);
            setError('Error al actualizar el estado del ticket');
            setActualizandoEstado(false);
        }
    };

    if (isLoading) return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <div>Cargando...</div>
            </main>
        </div>
    );

    if (error) return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <div className="error-message">{error}</div>
            </main>
        </div>
    );

    if (!ticket) return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <div>Ticket no encontrado</div>
            </main>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <div className="ticket-detail-container">
                    <button 
                        onClick={() => navigate('/consultar-tickets')}
                        className="back-button"
                    >
                        ← Volver
                    </button>

                    <div className="ticket-header">
                        <div className="ticket-title">
                            <h2>Ticket #{ticket.ticket_number}</h2>
                            <div className="estado-control">
                                <span className={`estado-badge ${ticket.estado.toLowerCase()}`}>
                                    {ticket.estado}
                                </span>
                                <select
                                    value={ticket.estado}
                                    onChange={(e) => cambiarEstado(e.target.value)}
                                    disabled={actualizandoEstado}
                                    className="estado-select"
                                >
                                    <option value="Abierto">Abierto</option>
                                    <option value="En Proceso">En Proceso</option>
                                    <option value="Resuelto">Resuelto</option>
                                    <option value="Cerrado">Cerrado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="ticket-info">
                        <h3>{ticket.titulo}</h3>
                        <p className="descripcion">{ticket.descripcion}</p>
                        <div className="meta-info">
                            <p>Creado por: {ticket.creador}</p>
                            <p>Email: {ticket.email_creador}</p>
                            <p>Fecha: {new Date(ticket.fecha_creacion).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="comentarios-section">
                        <h3>Comentarios</h3>
                        
                        <form onSubmit={agregarComentario} className="comentario-form">
                            <textarea
                                value={nuevoComentario}
                                onChange={(e) => setNuevoComentario(e.target.value)}
                                placeholder="Escribe un comentario..."
                                required
                            />
                            <button type="submit">Agregar Comentario</button>
                        </form>

                        <div className="comentarios-list">
                            {ticket.comentarios && ticket.comentarios.map(comentario => (
                                <div key={comentario.id} className="comentario">
                                    <div className="comentario-header">
                                        <strong>{comentario.autor}</strong>
                                        <span>{new Date(comentario.fecha_creacion).toLocaleString()}</span>
                                    </div>
                                    <p>{comentario.contenido}</p>
                                </div>
                            ))}
                            {(!ticket.comentarios || ticket.comentarios.length === 0) && (
                                <p className="no-comentarios">No hay comentarios aún.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TicketDetail; 