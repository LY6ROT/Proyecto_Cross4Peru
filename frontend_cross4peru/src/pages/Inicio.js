import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; 
import logo from '../assets/logo.png';
import imagenGym from '../assets/imagen inicio.webp';

const Inicio = () => {
    return (
        <div className="inicio-container">
            {/* --- SECCIÓN 1: HERO (Lo que ya tenías) --- */}
            <div className="hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <img 
                            src={logo} 
                            alt="Cross4Peru Logo Gigante" 
                            style={{ maxWidth: '300px', width: '80%', marginBottom: '20px' }} 
                        />
                        
                        <p className="hero-subtitle">
                            Somos un Team, no un gimnasio <br/>
                            Supera tus límites hoy
                        </p>
                        
                        <div className="hero-buttons">
                            <Link to="/registro" className="btn-primary">Inscribirse Ahora</Link>
                            <Link to="/planes" className="btn-outline">Ver Planes</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN 2: CONTACTO (NUEVO) --- */}
            <div className="contact-section">
                <div className="contact-content-wrapper">
                    
                    {/* Columna Izquierda: Información */}
                    <div className="contact-info">
                        <h2 className="contact-title">CONTACTO</h2>
                        
                        {/* Email */}
                        <div className="contact-item">
                            <span className="icon">📧</span>
                            <a href="mailto:cross4peru@hotmail.com">cross4peru@hotmail.com</a>
                        </div>

                        {/* Teléfono */}
                        <div className="contact-item">
                            <span className="icon">📱</span>
                            <a href="tel:+51947640889">+51 947 640 889</a>
                        </div>

                        {/* Instagram */}
                        <div className="contact-item">
                            <span className="icon">📸</span>
                            <a href="https://www.instagram.com/cross4peru/?hl=es" target="_blank" rel="noreferrer">
                                @cross4peru
                            </a>
                        </div>

                        {/* Dirección */}
                        <div className="contact-item">
                            <span className="icon">📍</span>
                            <p>
                                Las Palmeras 388 A - Chaclacayo,<br/>
                                Lima, 015 Perú
                            </p>
                        </div>

                        {/* WhatsApp (Botón destacado) */}
                        <div className="contact-item whatsapp-box">
                            <span className="icon">💬</span>
                            <a href="https://wa.me/51947640889" target="_blank" rel="noreferrer" className="whatsapp-link">
                                Escríbenos al WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* Columna Derecha: Imagen */}
                    <div className="contact-image-container">
                        {/* Usamos una imagen de alta calidad de Unsplash como placeholder */}
                        <img 
                            src={imagenGym} 
                            alt="Chica entrenando en el gym" 
                            className="gym-girl-img"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Inicio;