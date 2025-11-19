import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Importamos estilos globales

const Inicio = () => {
    return (
        <div className="hero-section">
            <div className="hero-overlay">
                <div className="hero-content">
                    {/* Aquí iría tu logo real. Por ahora usamos texto estilizado */}
                    <h1 className="brand-title">CROSS<span className="text-red">4</span>PERÚ</h1>
                    
                    <p className="hero-subtitle">
                        Somos un Team, no un gimnasio. <br/>
                        Supera tus límites hoy.
                    </p>
                    
                    <div className="hero-buttons">
                        <Link to="/registro" className="btn-primary">Inscribirse Ahora</Link>
                        <Link to="/planes" className="btn-outline">Ver Planes</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inicio;