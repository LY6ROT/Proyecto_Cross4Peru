import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../App.css'; // Usaremos estilos básicos por ahora

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Al salir, lo mandamos al inicio
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                {/* Aquí pondrás tu imagen luego */}
                <h2>Cross4Peru</h2>
            </div>
            <ul className="navbar-links">
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/planes">Planes</Link></li>

                {user ? (
                    // --- MENÚ PARA USUARIO LOGUEADO ---
                    <>
                        <li><Link to="/pagos">Pagos</Link></li>
                        <li><Link to="/asistencia">Asistencia</Link></li>
                        <li><Link to="/mi-cuenta">Mi Cuenta ({user.nombre})</Link></li>
                        {/* Si es admin, mostramos panel extra */}
                        {user.rol_id === 1 && (
                            <li><Link to="/admin" style={{color: 'orange'}}>Panel Admin</Link></li>
                        )}
                        <li><button onClick={handleLogout} className="btn-logout">Salir</button></li>
                    </>
                ) : (
                    // --- MENÚ PARA USUARIO NO LOGUEADO ---
                    <>
                        <li><Link to="/registro">Inscribirse</Link></li>
                        <li><Link to="/login">Iniciar Sesión</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;