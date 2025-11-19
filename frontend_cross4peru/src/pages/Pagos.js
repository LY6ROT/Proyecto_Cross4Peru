import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

const Pagos = () => {
    const { user } = useContext(AuthContext);
    
    // Estados
    const [activeTab, setActiveTab] = useState('pagar');
    const [loading, setLoading] = useState(true);
    const [pendiente, setPendiente] = useState(null);
    const [historial, setHistorial] = useState([]);
    
    // Formulario
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
    const [tarjeta, setTarjeta] = useState({ numero: '', nombre: '', exp: '', cvv: '' });
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
        if (user) {
            fetchPagosData();
        }
    }, [user]);

    const fetchPagosData = async () => {
        try {
            // Petición al backend
            const res = await axios.get(`http://localhost:3001/api/pagos/${user.id}`);
            console.log("Datos del servidor:", res.data); // Mira la consola para ver qué llega
            
            setPendiente(res.data.pendiente);
            setHistorial(res.data.historial || []);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePagoSubmit = async (e) => {
        e.preventDefault();
        if (!pendiente) return;

        try {
            // 1. Actualizar fecha
            await axios.post('http://localhost:3001/api/inscripciones', {
                usuario_id: user.id,
                plan_id: pendiente.plan_id,
                fecha_inicio: fechaInicio
            });

            // 2. Procesar Pago
            const res = await axios.post('http://localhost:3001/api/pagos/procesar', {
                usuario_id: user.id,
                inscripcion_id: pendiente.id,
                monto: pendiente.precio,
                metodo_pago: 'tarjeta',
                tarjeta: tarjeta
            });

            setResultado({ exito: true, datos: res.data.comprobante });
            fetchPagosData(); // Recargar datos

        } catch (error) {
            setResultado({ exito: false, mensaje: "Error al procesar el pago." });
        }
    };

    // --- ESTILOS INLINE PARA GARANTIZAR VISIBILIDAD ---
    const containerStyle = { color: 'white', maxWidth: '800px', margin: '0 auto', padding: '20px' };
    const cardStyle = { background: '#222', padding: '20px', borderRadius: '8px', marginTop: '20px', border: '1px solid #444' };
    const btnStyle = { background: '#d32f2f', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' };
    const inputStyle = { width: '100%', padding: '8px', margin: '5px 0', background: '#333', color: 'white', border: '1px solid #555' };

    if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Cargando...</div>;

    return (
        <div style={containerStyle}>
            <h2>Gestión de Pagos</h2>

            {/* Pestañas */}
            <div style={{marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px'}}>
                <button onClick={() => setActiveTab('pagar')} style={{...btnStyle, background: activeTab === 'pagar' ? '#d32f2f' : 'transparent', marginRight: '10px'}}>Pagar</button>
                <button onClick={() => setActiveTab('historial')} style={{...btnStyle, background: activeTab === 'historial' ? '#d32f2f' : 'transparent'}}>Historial</button>
            </div>

            {/* CONTENIDO PESTAÑA PAGAR */}
            {activeTab === 'pagar' && (
                <div>
                    {pendiente ? (
                        <div style={cardStyle}>
                            <h3 style={{color: '#d32f2f', marginTop: 0}}>Confirmar Pago: {pendiente.nombre}</h3>
                            <p style={{fontSize: '1.2rem'}}>Total a pagar: <strong>S/{pendiente.precio}</strong></p>
                            
                            <form onSubmit={handlePagoSubmit} style={{marginTop: '20px'}}>
                                <label>Fecha de Inicio:</label>
                                <input type="date" style={inputStyle} value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required />
                                
                                <h4 style={{marginTop: '15px'}}>Tarjeta (Simulada)</h4>
                                <input type="text" placeholder="Número de Tarjeta" style={inputStyle} onChange={e => setTarjeta({...tarjeta, numero: e.target.value})} required />
                                <div style={{display:'flex', gap:'10px'}}>
                                    <input type="text" placeholder="MM/AA" style={inputStyle} required />
                                    <input type="text" placeholder="CVV" style={inputStyle} required />
                                </div>
                                <input type="text" placeholder="Nombre del Titular" style={inputStyle} required />
                                
                                <button type="submit" style={{...btnStyle, width: '100%', marginTop: '20px', fontSize: '1.1rem'}}>PAGAR AHORA</button>
                            </form>
                        </div>
                    ) : (
                        <div style={{...cardStyle, textAlign: 'center', padding: '40px'}}>
                            <h3>No hay pagos pendientes</h3>
                            <p>¡Estás al día! Ve a Planes si quieres inscribirte en uno nuevo.</p>
                            <a href="/planes" style={{color: '#d32f2f', fontWeight: 'bold'}}>Ver Planes</a>
                        </div>
                    )}
                </div>
            )}

            {/* CONTENIDO PESTAÑA HISTORIAL */}
            {activeTab === 'historial' && (
                <div style={cardStyle}>
                    {historial.length > 0 ? (
                        <ul style={{listStyle: 'none', padding: 0}}>
                            {historial.map(p => (
                                <li key={p.id} style={{borderBottom: '1px solid #444', padding: '10px 0'}}>
                                    <strong>{new Date(p.fecha_pago).toLocaleDateString()}</strong> - {p.nombre_plan}
                                    <br/>
                                    <span style={{color: '#2ecc71'}}>Pagado (S/{p.monto})</span> - Boleta: {p.serie}-{p.numero_correlativo}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No tienes historial de pagos.</p>
                    )}
                </div>
            )}

            {/* MODAL POPUP */}
            {resultado && (
                <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <div style={{background:'white', color:'black', padding:'30px', borderRadius:'8px', width:'300px', textAlign:'center'}}>
                        <h2 style={{color: resultado.exito ? 'green' : 'red'}}>{resultado.exito ? '¡Éxito!' : 'Error'}</h2>
                        <p>{resultado.exito ? 'Tu pago se procesó correctamente.' : resultado.mensaje}</p>
                        
                        {resultado.exito && (
                            <div style={{background: '#f9f9f9', padding: '10px', borderRadius: '4px', textAlign: 'left', margin: '10px 0'}}>
                                <p style={{margin: '5px 0'}}><strong>Boleta:</strong> {resultado.datos.serie}-{resultado.datos.correlativo}</p>
                                <p style={{margin: '5px 0'}}><strong>Monto:</strong> S/{resultado.datos.monto}</p>
                            </div>
                        )}
                        
                        <button onClick={() => setResultado(null)} style={btnStyle}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pagos;