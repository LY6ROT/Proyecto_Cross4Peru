import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Asistencia = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [estado, setEstado] = useState({});
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    // Calendario
    const [currentDate, setCurrentDate] = useState(new Date());

    const cargarDatos = useCallback(async () => {
        if (!user) return;
        try {
            const resEstado = await axios.get(`http://localhost:3001/api/asistencia/estado/${user.id}`);
            setEstado(resEstado.data);
            const resHistorial = await axios.get(`http://localhost:3001/api/asistencia/historial/${user.id}`);
            setHistorial(resHistorial.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { cargarDatos(); }, [cargarDatos]);

    // Lógica visual del calendario
    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysArray = [];

        for (let i = 0; i < firstDay; i++) daysArray.push(<div key={`e-${i}`} className="calendar-day"></div>);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const asistio = historial.some(h => new Date(h.fecha).toISOString().split('T')[0] === dateString);
            const isToday = new Date().toISOString().split('T')[0] === dateString;
            
            let cls = 'calendar-day';
            if (asistio) cls += ' day-attended';
            if (isToday) cls += ' day-today';

            daysArray.push(<div key={day} className={cls}>{day}</div>);
        }

        return (
            <div className="calendar-container">
                <div className="calendar-header">
                    <button className="calendar-nav-btn" onClick={() => setCurrentDate(new Date(year, month - 1))}>❮</button>
                    <span>{meses[month]} {year}</span>
                    <button className="calendar-nav-btn" onClick={() => setCurrentDate(new Date(year, month + 1))}>❯</button>
                </div>
                <div className="calendar-grid">
                    {["D", "L", "M", "M", "J", "V", "S"].map(d => <div key={d} className="calendar-day-name">{d}</div>)}
                    {daysArray}
                </div>
            </div>
        );
    };

    if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Cargando...</div>;

    return (
        <div style={{ color: 'white', maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
            <h2 style={{borderBottom:'2px solid var(--primary-red)', paddingBottom:'10px'}}>Mi Asistencia</h2>

            {/* AVISOS DE ESTADO (Solo informativos, sin botón de marcar) */}
            <div style={{background: '#1e1e1e', padding: '20px', borderRadius: '10px', textAlign: 'center', marginBottom: '30px', border:'1px solid #333'}}>
                {estado.motivo === 'pendiente_pago' ? (
                    <>
                        <h3 style={{color: '#e74c3c'}}>⚠️ Suscripción Pendiente</h3>
                        <p>Realiza tu pago para regularizar tu acceso.</p>
                        <button onClick={() => navigate('/pagos')} className="btn-primary" style={{marginTop:'10px'}}>Ir a Pagar</button>
                    </>
                ) : estado.motivo === 'sin_plan' ? (
                    <>
                        <h3>Sin Plan</h3>
                        <button onClick={() => navigate('/planes')} className="btn-primary">Ver Planes</button>
                    </>
                ) : (
                    <>
                        <h3 style={{color: '#2ecc71'}}>Suscripción Activa</h3>
                        <p>Recuerda registrar tu asistencia en recepción al llegar.</p>
                    </>
                )}
            </div>

            {renderCalendar()}
        </div>
    );
};

export default Asistencia;