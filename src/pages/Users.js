import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './style.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [currentUser, setCurrentUser] = useState(JSON.parse(sessionStorage.getItem('usuario')));

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/get-all-users', {
                headers: {
                    'user-id': currentUser.id
                }
            });
            setUsers(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            setError(error.response?.data?.message || 'Error al cargar la lista de usuarios');
            setIsLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
            try {
                await axios.delete(`http://localhost:3001/delete-user/${userId}`, {
                    headers: {
                        'user-id': currentUser.id
                    }
                });
                setUsers(users.filter(user => user.id !== userId));
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                setError(error.response?.data?.message || 'Error al eliminar el usuario');
            }
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!selectedUser || !newPassword) return;

        try {
            await axios.put(`http://localhost:3001/reset-password/${selectedUser.id}`, {
                newPassword
            }, {
                headers: {
                    'user-id': currentUser.id
                }
            });
            setShowResetModal(false);
            setSelectedUser(null);
            setNewPassword('');
            alert('Contraseña restablecida exitosamente');
        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            setError(error.response?.data?.message || 'Error al restablecer la contraseña');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put('http://localhost:3001/update-user-role', {
                userId,
                newRole
            }, {
                headers: {
                    'user-id': currentUser.id
                }
            });
            
            // Actualizar la lista de usuarios localmente
            setUsers(users.map(user => 
                user.id === userId ? { ...user, rol: newRole } : user
            ));
            
            alert('Rol actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar rol:', error);
            alert(error.response?.data?.message || 'Error al actualizar el rol');
        }
    };

    if (isLoading) return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <div className="loading-message">
                    <p>Cargando usuarios...</p>
                </div>
            </main>
        </div>
    );

    if (error) return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={loadUsers} className="retry-btn">
                        🔄 Intentar nuevamente
                    </button>
                </div>
            </main>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <h2>👥 Gestión de Usuarios</h2>
                
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Área</th>
                                <th>Empresa</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.nombre}</td>
                                    <td>{user.email}</td>
                                    <td>{user.telefono || 'N/A'}</td>
                                    <td>{user.area || 'N/A'}</td>
                                    <td>{user.empresa || 'N/A'}</td>
                                    <td>
                                        {currentUser.rol === 'administrador' ? (
                                            <select
                                                value={user.rol}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="role-select"
                                            >
                                                <option value="administrador">Administrador</option>
                                                <option value="soporte">Soporte</option>
                                                <option value="normal">Normal</option>
                                            </select>
                                        ) : (
                                            user.rol
                                        )}
                                    </td>
                                    <td>
                                        {currentUser.rol === 'administrador' && (
                                            <div className="action-buttons">
                                                <button
                                                    className="reset-btn"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowResetModal(true);
                                                    }}
                                                >
                                                    🔑 Restablecer Contraseña
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showResetModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Restablecer Contraseña</h3>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowResetModal(false);
                                    setSelectedUser(null);
                                    setNewPassword('');
                                }}
                            >
                                ×
                            </button>
                            <form onSubmit={handleResetPassword}>
                                <div className="form-group">
                                    <label>Nueva contraseña para {selectedUser?.nombre}:</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Nueva contraseña"
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <button type="submit">Restablecer Contraseña</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Users; 