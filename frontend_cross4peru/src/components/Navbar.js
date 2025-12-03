import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../App.css'; 
// 1. Importamos la imagen desde la carpeta assets (subimos un nivel con ..)
import logo from '../assets/logo.png'; 

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); 
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                {/* 2. Reemplazamos el texto H2 por la imagen con un Link al inicio */}
                <Link to="/">
                    <img 
                        src={logo} 
                        alt="Logo Cross4Peru" 
                        style={{ height: '60px', objectFit: 'contain' }} 
                    />
                </Link>
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