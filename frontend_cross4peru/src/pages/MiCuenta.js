import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../App.css';

const MiCuenta = () => {
    const { user } = useContext(AuthContext); // Sacamos el ID del usuario logueado
    const [perfil, setPerfil] = useState(null);
    const [planActivo, setPlanActivo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const obtenerDatos = async () => {
                try {
                    const res = await axios.get(`http://localhost:3001/api/usuarios/${user.id}`);
                    setPerfil(res.data.usuario);
                    setPlanActivo(res.data.plan);
                } catch (error) {
                    console.error("Error cargando perfil:", error);
                } finally {
                    setLoading(false);
                }
            };
            obtenerDatos();
        }
    }, [user]);

    if (loading) return <div className="loading">Cargando tus datos...</div>;
    if (!perfil) return <div className="loading">No se encontró información.</div>;

    return (
        <div className="cuenta-container">
            <h2>Mi Cuenta</h2>
            <p>Información personal y estado de tu membresía.</p>

            <div className="cuenta-grid">
                {/* Tarjeta de Datos Personales (Solo lectura) */}
                <div className="cuenta-card">
                    <h3>Datos Personales</h3>
                    <div className="info-group">
                        <label>Nombre Completo:</label>
                        <p className="info-value">{perfil.nombre_completo}</p>
                    </div>
                    <div className="info-group">
                        <label>Correo Electrónico:</label>
                        <p className="info-value">{perfil.correo}</p>
                    </div>
                    <div className="info-group">
                        <label>Teléfono:</label>
                        <p className="info-value">{perfil.telefono}</p>
                    </div>
                    <div className="info-group">
                        <label>Miembro desde:</label>
                        <p className="info-value">{new Date(perfil.fecha_registro).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Tarjeta de Plan Activo */}
                <div className="cuenta-card plan-status-card">
                    <h3>Plan Actual</h3>
                    {planActivo ? (
                        <>
                            <h4 className="plan-name-active">{planActivo.nombre_plan}</h4>
                            <p className="plan-dates">
                                Vence el: <strong>{new Date(planActivo.fecha_fin).toLocaleDateString()}</strong>
                            </p>
                            <div className="badge-active">ACTIVO</div>
                        </>
                    ) : (
                        <>
                            <p>No tienes ningún plan activo actualmente.</p>
                            <a href="/planes" className="btn-small">Ver Planes</a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MiCuenta;