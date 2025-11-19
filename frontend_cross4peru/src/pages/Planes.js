import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; // Importamos para poder navegar
import { AuthContext } from '../context/AuthContext'; // Ruta relativa corregida
import '../App.css'; // Ruta relativa corregida

const Planes = () => {
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hooks para navegación y usuario
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Cargar los planes al iniciar
    useEffect(() => {
        const cargarPlanes = async () => {
            try {
                const respuesta = await axios.get('http://localhost:3001/api/planes');
                setPlanes(respuesta.data);
                setLoading(false);
            } catch (error) {
                console.error("Error cargando planes:", error);
                setLoading(false);
            }
        };

        cargarPlanes();
    }, []);

    // --- LÓGICA NUEVA: MANEJAR LA ELECCIÓN DEL PLAN ---
    const handleElegirPlan = async (planId) => {
        // 1. Si no está logueado, lo mandamos a registrarse
        if (!user) {
            alert("Debes registrarte o iniciar sesión para elegir un plan.");
            return navigate('/registro');
        }

        try {
            // 2. Si ya es usuario, creamos una "pre-inscripción" en estado pendiente
            await axios.post('http://localhost:3001/api/inscripciones', {
                usuario_id: user.id,
                plan_id: planId,
                fecha_inicio: new Date().toISOString().split('T')[0] // Fecha de hoy como default
            });

            // 3. Lo redirigimos a la pantalla de Pagos para que complete la compra
            navigate('/pagos');

        } catch (error) {
            console.error("Error al elegir plan:", error);
            alert("Hubo un problema al procesar tu solicitud.");
        }
    };

    if (loading) return <div className="loading">Cargando planes...</div>;

    return (
        <div className="planes-container">
            <h2>Nuestros Planes de Entrenamiento</h2>
            <p>Elige el nivel que mejor se adapte a tus objetivos</p>
            
            <div className="planes-grid">
                {planes.map((plan) => (
                    <div key={plan.id} className={`plan-card ${plan.nombre.includes('PRO') ? 'plan-pro' : ''}`}>
                        <h3>{plan.nombre}</h3>
                        <div className="plan-price">
                            S/{plan.precio} <span>/ mes</span>
                        </div>
                        <p className="plan-desc">{plan.descripcion}</p>
                        
                        <ul className="plan-features">
                            {/* Beneficios Generales */}
                            <li>✅ Acceso al Box</li>
                            <li>✅ Registro de Asistencia App</li>

                            {/* Beneficios Específicos (Lógica visual) */}
                            {(plan.nombre.includes('Atleta') || plan.nombre.includes('PRO')) && (
                                <li>✅ Plan de Alimentación</li>
                            )}
                            {plan.nombre.includes('PRO') && (
                                <>
                                    <li>✅ Asesoría Personalizada</li>
                                    <li>✅ Suplementación</li>
                                </>
                            )}
                        </ul>

                        {/* BOTÓN ACTUALIZADO CON LA LÓGICA */}
                        <button 
                            className="btn-plan" 
                            onClick={() => handleElegirPlan(plan.id)}
                        >
                            Elegir {plan.nombre}
                        </button>
                        
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Planes;