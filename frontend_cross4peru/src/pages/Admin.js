import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Admin = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estado para manejar qué fila está expandida (ID del usuario)
    const [expandedUserId, setExpandedUserId] = useState(null);
    // Historial del usuario expandido
    const [userHistory, setUserHistory] = useState([]);
    // Fecha actual del calendario admin
    const [calendarDate, setCalendarDate] = useState(new Date());

    useEffect(() => {
        if (user && user.rol_id !== 1) navigate('/');
    }, [user, navigate]);

    const fetchClientes = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/admin/clientes');
            setClientes(res.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchClientes(); }, [fetchClientes]);

    // Función para abrir/cerrar detalles de un usuario
    const toggleRow = async (userId) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null); // Cerrar si ya está abierto
        } else {
            setExpandedUserId(userId); // Abrir
            // Cargar historial de ese usuario específico
            try {
                const res = await axios.get(`http://localhost:3001/api/admin/historial/${userId}`);
                setUserHistory(res.data);
            } catch (err) { alert("Error cargando historial"); }
        }
    };

    // Función: Admin marca asistencia en una fecha específica
    const handleAdminMark = async (userId, dateString) => {
        const confirmar = window.confirm(`¿Marcar asistencia para el ${dateString}?`);
        if (!confirmar) return;

        try {
            await axios.post('http://localhost:3001/api/admin/asistencia', { 
                usuario_id: userId,
                fecha: dateString
            });
            alert("Asistencia Agregada ✅");
            // Recargar historial
            const res = await axios.get(`http://localhost:3001/api/admin/historial/${userId}`);
            setUserHistory(res.data);
        } catch (error) {
            alert(error.response?.data?.mensaje || "Error al marcar.");
        }
    };

    const handlePagoEfectivo = async (cliente) => {
        if (!cliente.inscripcion_id) return alert("Sin plan elegido.");
        const confirmar = window.confirm(`¿Cobrar S/${cliente.precio_plan} en efectivo?`);
        if (!confirmar) return;

        try {
            await axios.post('http://localhost:3001/api/admin/pagos/efectivo', {
                usuario_id: cliente.id,
                inscripcion_id: cliente.inscripcion_id,
                monto: cliente.precio_plan
            });
            alert("Pago registrado ✅");
            fetchClientes();
        } catch (error) { alert("Error al registrar pago."); }
    };

    // --- RENDERIZADO DEL CALENDARIO (Reutilizable para cada fila) ---
    const renderAdminCalendar = (userId) => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysArray = [];

        for (let i = 0; i < firstDay; i++) daysArray.push(<div key={`e-${i}`}></div>);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const asistio = userHistory.some(h => new Date(h.fecha).toISOString().split('T')[0] === dateString);
            
            daysArray.push(
                <div 
                    key={day} 
                    onClick={() => !asistio && handleAdminMark(userId, dateString)}
                    style={{
                        padding: '8px', cursor: 'pointer', borderRadius: '4px', textAlign: 'center',
                        background: asistio ? '#2ecc71' : '#333', color: asistio ? 'black' : '#ccc',
                        fontWeight: asistio ? 'bold' : 'normal', border: '1px solid #444'
                    }}
                    title={asistio ? 'Asistió' : 'Click para marcar'}
                >
                    {day}
                </div>
            );
        }

        return (
            <div style={{background: '#111', padding: '15px', marginTop: '10px', borderRadius: '8px'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', alignItems:'center'}}>
                    <button onClick={() => setCalendarDate(new Date(year, month - 1))} style={{background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'1.2rem'}}>❮</button>
                    <span style={{fontWeight:'bold', color:'var(--primary-red)'}}>{meses[month]} {year}</span>
                    <button onClick={() => setCalendarDate(new Date(year, month + 1))} style={{background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'1.2rem'}}>❯</button>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px'}}>
                    {daysArray}
                </div>
                <p style={{fontSize:'0.8rem', color:'#777', marginTop:'10px', textAlign:'center'}}>* Click en un día gris para marcar asistencia manual.</p>
            </div>
        );
    };

    // --- ESTILOS ---
    const containerStyle = { padding: '40px', color: 'white', maxWidth: '1200px', margin: '0 auto' };
    const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#1e1e1e', borderRadius: '10px' };
    const thStyle = { background: '#000', padding: '15px', textAlign: 'left', color: '#aaa', borderBottom: '2px solid var(--primary-red)' };
    const tdStyle = { padding: '15px', borderBottom: '1px solid #333' };

    if (loading) return <div style={{textAlign:'center', color:'white', marginTop:'50px'}}>Cargando...</div>;

    return (
        <div style={containerStyle}>
            <h2>Panel de Administrador</h2>
            <p style={{color:'#ccc'}}>Gestión de Socios y Asistencias</p>

            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Nombre</th>
                        <th style={thStyle}>Plan</th>
                        <th style={thStyle}>Estado</th>
                        <th style={thStyle}>Cobro</th>
                        <th style={thStyle}>Detalle</th> 
                    </tr>
                </thead>
                <tbody>
                    {clientes.map(cli => (
                        <React.Fragment key={cli.id}>
                            <tr style={{background: expandedUserId === cli.id ? '#252525' : 'transparent'}}>
                                <td style={tdStyle}>
                                    <strong>{cli.nombre_completo}</strong><br/>
                                    <span style={{fontSize:'0.8rem', color:'#888'}}>{cli.correo}</span>
                                </td>
                                <td style={tdStyle}>{cli.nombre_plan || '-'}</td>
                                <td style={tdStyle}>
                                    {cli.estado_plan === 'activo' && <span style={{color:'#2ecc71'}}>ACTIVO</span>}
                                    {cli.estado_plan === 'pendiente_pago' && <span style={{color:'#f1c40f'}}>PENDIENTE</span>}
                                    {!cli.estado_plan && <span style={{color:'#7f8c8d'}}>--</span>}
                                </td>
                                <td style={tdStyle}>
                                    {cli.estado_plan === 'pendiente_pago' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handlePagoEfectivo(cli); }}
                                            style={{background:'transparent', border:'1px solid #f1c40f', color:'#f1c40f', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}
                                        >
                                            Cobrar S/{cli.precio_plan}
                                        </button>
                                    )}
                                </td>
                                {/* AQUÍ ESTABA EL ERROR: Se eliminó el estilo duplicado */}
                                <td onClick={() => toggleRow(cli.id)} style={{...tdStyle, cursor:'pointer', textAlign:'center'}}>
                                    {expandedUserId === cli.id ? '▲' : '▼'}
                                </td>
                            </tr>
                            {/* FILA EXPANDIBLE (CALENDARIO) */}
                            {expandedUserId === cli.id && (
                                <tr>
                                    <td colSpan="5" style={{padding:'20px', background:'#222', borderBottom:'1px solid #333'}}>
                                        <h4 style={{marginTop:0, color:'white'}}>Asistencia de {cli.nombre_completo}</h4>
                                        {renderAdminCalendar(cli.id)}
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Admin;