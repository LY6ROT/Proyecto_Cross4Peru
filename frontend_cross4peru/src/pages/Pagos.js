import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
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
    const [opcionFecha, setOpcionFecha] = useState('hoy');
    
    const [tarjeta, setTarjeta] = useState({ numero: '', nombre: '', exp: '', cvv: '' });
    const [resultado, setResultado] = useState(null);

    // --- CARGA DE DATOS ---
    const fetchPagosData = useCallback(async () => {
        if (!user) return;
        try {
            const res = await axios.get(`http://localhost:3001/api/pagos/${user.id}`);
            setPendiente(res.data.pendiente);
            setHistorial(res.data.historial || []);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchPagosData();
        }
    }, [user, fetchPagosData]);

    // --- LÓGICA FORMULARIO TARJETA ---
    const handleExpiryChange = (e) => {
        let valor = e.target.value.replace(/\D/g, ''); 
        if (valor.length >= 3) {
            valor = valor.slice(0, 2) + '/' + valor.slice(2, 4);
        }
        setTarjeta({ ...tarjeta, exp: valor });
    };

    const handleCvvChange = (e) => {
        const valor = e.target.value.replace(/\D/g, '').slice(0, 4);
        setTarjeta({ ...tarjeta, cvv: valor });
    };

    const handleNumeroChange = (e) => {
        let valor = e.target.value.replace(/\D/g, '').slice(0, 16);
        valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
        setTarjeta({ ...tarjeta, numero: valor });
    };

    // --- FUNCIÓN GENERAR PDF ---
    const generarBoletaPDF = (pago) => {
        const doc = new jsPDF();

        // 1. Encabezado
        doc.setFontSize(22);
        doc.setTextColor(211, 47, 47); // Rojo
        doc.text("CROSS4PERU", 105, 20, null, null, "center");
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Comprobante de Pago Electrónico", 105, 30, null, null, "center");

        // 2. Datos
        doc.setFontSize(10);
        doc.text(`Cliente: ${user.nombre}`, 14, 45);
        doc.text(`Fecha: ${new Date(pago.fecha_pago).toLocaleDateString()}`, 14, 52);
        doc.text(`Serie: ${pago.serie}-${pago.numero_correlativo}`, 140, 45);
        doc.text(`Pago: ${pago.metodo_pago ? pago.metodo_pago.toUpperCase() : 'TARJETA'}`, 140, 52);

        // 3. Tabla
        autoTable(doc, {
            startY: 60,
            head: [['Descripción', 'Monto Total']],
            body: [
                [pago.nombre_plan, `S/ ${pago.monto}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [211, 47, 47] },
        });

        // 4. Pie de página
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 80;
        
        doc.setFontSize(10);
        doc.setTextColor(0,0,0);
        doc.text("Gracias por tu preferencia.", 105, finalY + 20, null, null, "center");
        
        // 5. Descargar
        doc.save(`Boleta_${pago.numero_correlativo}.pdf`);
    };

    // --- PROCESAR PAGO ---
    const handlePagoSubmit = async (e) => {
        e.preventDefault();
        if (!pendiente) return;

        const fechaFinal = opcionFecha === 'hoy' 
            ? new Date().toISOString().split('T')[0] 
            : fechaInicio;

        try {
            await axios.post('http://localhost:3001/api/inscripciones', {
                usuario_id: user.id, // CORREGIDO: Backend 'pagos.routes.js' espera usuario_id
                plan_id: pendiente.plan_id,
                fecha_inicio: fechaFinal
            });

            const res = await axios.post('http://localhost:3001/api/pagos/procesar', {
                usuario_id: user.id, // CORREGIDO: Backend 'pagos.routes.js' espera usuario_id
                inscripcion_id: pendiente.id,
                monto: pendiente.precio,
                metodo_pago: 'tarjeta',
                tarjeta: tarjeta
            });

            setResultado({ exito: true, datos: res.data.comprobante });
            fetchPagosData(); 

        } catch (error) {
            setResultado({ exito: false, mensaje: "Error al procesar el pago." });
        }
    };

    // --- ESTILOS ---
    const containerStyle = { color: 'white', maxWidth: '800px', margin: '40px auto', padding: '20px' };
    const cardStyle = { background: '#1e1e1e', padding: '30px', borderRadius: '10px', marginTop: '20px', border: '1px solid #333', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' };
    
    const getTabStyle = (tabName) => ({
        background: activeTab === tabName ? 'var(--primary-red)' : 'transparent',
        color: 'white',
        border: activeTab === tabName ? 'none' : '1px solid #555',
        padding: '10px 20px',
        cursor: 'pointer',
        borderRadius: '5px',
        fontWeight: 'bold',
        marginRight: '10px',
        transition: 'all 0.3s ease'
    });

    const inputStyle = { width: '100%', padding: '12px', margin: '8px 0', background: '#2a2a2a', color: 'white', border: '1px solid #444', borderRadius: '5px' };
    const btnStyle = { background: 'var(--primary-red)', color: 'white', border: 'none', padding: '15px', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold', width: '100%', fontSize: '1.1rem', marginTop: '15px' };
    const btnDescargarStyle = { background: 'transparent', border: '1px solid var(--primary-red)', color: 'var(--primary-red)', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' };

    if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Cargando...</div>;

    return (
        <div style={containerStyle}>
            <h2 style={{borderBottom:'2px solid var(--primary-red)', paddingBottom:'10px'}}>Gestión de Pagos</h2>

            <div style={{marginBottom: '20px'}}>
                <button onClick={() => setActiveTab('pagar')} style={getTabStyle('pagar')}>Pagar</button>
                <button onClick={() => setActiveTab('historial')} style={getTabStyle('historial')}>Historial</button>
            </div>

            {activeTab === 'pagar' && (
                <div>
                    {pendiente ? (
                        <div style={cardStyle}>
                            <h3 style={{color: 'var(--primary-red)', marginTop: 0}}>Confirmar Pago: {pendiente.nombre}</h3>
                            <p style={{fontSize: '1.5rem'}}>Total a pagar: <strong>S/{pendiente.precio}</strong></p>
                            
                            <form onSubmit={handlePagoSubmit} style={{marginTop: '20px'}}>
                                <div style={{background: '#111', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
                                    <label style={{display:'block', marginBottom:'10px', color:'#ccc'}}>Fecha de Inicio:</label>
                                    <div style={{display:'flex', gap:'20px', marginBottom:'10px'}}>
                                        <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                                            <input type="radio" name="fecha_opt" checked={opcionFecha === 'hoy'} onChange={() => setOpcionFecha('hoy')} /> 
                                            Empezar Hoy
                                        </label>
                                        <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                                            <input type="radio" name="fecha_opt" checked={opcionFecha === 'elegir'} onChange={() => setOpcionFecha('elegir')} /> 
                                            Elegir Fecha
                                        </label>
                                    </div>
                                    
                                    {opcionFecha === 'elegir' && (
                                        <input type="date" style={inputStyle} value={fechaInicio} min={new Date().toISOString().split('T')[0]} onChange={e => setFechaInicio(e.target.value)} required />
                                    )}
                                </div>
                                
                                <h4>Tarjeta de Crédito / Débito</h4>
                                <input type="text" placeholder="Número de Tarjeta" style={inputStyle} value={tarjeta.numero} onChange={handleNumeroChange} maxLength="19" required />
                                <input type="text" placeholder="Nombre del Titular" style={inputStyle} onChange={e => setTarjeta({...tarjeta, nombre: e.target.value})} required />
                                <div style={{display:'flex', gap:'10px'}}>
                                    <input type="text" placeholder="MM/AA" style={inputStyle} value={tarjeta.exp} onChange={handleExpiryChange} maxLength="5" required />
                                    <input type="password" placeholder="CVV" style={inputStyle} value={tarjeta.cvv} onChange={handleCvvChange} maxLength="4" required />
                                </div>
                                
                                <button type="submit" style={btnStyle}>PAGAR AHORA</button>
                            </form>
                        </div>
                    ) : (
                        <div style={{...cardStyle, textAlign: 'center', padding: '50px'}}>
                            <div style={{fontSize: '3rem', marginBottom:'10px'}}>✅</div>
                            <h3>No hay pagos pendientes</h3>
                            <p style={{color: '#bbb'}}>¡Estás al día! Ve a Planes si quieres inscribirte en uno nuevo.</p>
                            <a href="/planes" style={{color: 'var(--primary-red)', fontWeight: 'bold', textDecoration:'none', border:'1px solid var(--primary-red)', padding:'10px 20px', borderRadius:'5px', display:'inline-block', marginTop:'10px'}}>Ver Planes</a>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'historial' && (
                <div style={cardStyle}>
                    {historial.length > 0 ? (
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead>
                                <tr style={{borderBottom:'1px solid #555', color:'#bbb', textAlign:'left'}}>
                                    <th style={{padding:'10px'}}>Fecha</th>
                                    <th style={{padding:'10px'}}>Concepto</th>
                                    <th style={{padding:'10px'}}>Monto</th>
                                    <th style={{padding:'10px', textAlign:'center'}}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map(p => (
                                    <tr key={p.id} style={{borderBottom: '1px solid #333'}}>
                                        <td style={{padding:'15px 10px'}}>{new Date(p.fecha_pago).toLocaleDateString()}</td>
                                        <td style={{padding:'15px 10px'}}>
                                            {p.nombre_plan} <br/>
                                            <span style={{fontSize:'0.8rem', color:'#888'}}>{p.serie}-{p.numero_correlativo}</span>
                                        </td>
                                        <td style={{padding:'15px 10px', color: '#2ecc71', fontWeight:'bold'}}>S/{p.monto}</td>
                                        <td style={{padding:'15px 10px', textAlign:'center'}}>
                                            <button 
                                                onClick={() => generarBoletaPDF(p)}
                                                style={btnDescargarStyle}
                                                title="Descargar comprobante en PDF"
                                            >
                                                📥 Descargar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{textAlign:'center', color:'#bbb'}}>No tienes historial de pagos.</p>
                    )}
                </div>
            )}

            {resultado && (
                <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1000}}>
                    <div style={{background:'#1e1e1e', color:'white', padding:'40px', borderRadius:'10px', width:'350px', textAlign:'center', border: `1px solid ${resultado.exito ? '#2ecc71' : '#e74c3c'}`}}>
                        <div style={{fontSize: '4rem', marginBottom:'10px'}}>{resultado.exito ? '🎉' : '❌'}</div>
                        <h2 style={{color: resultado.exito ? '#2ecc71' : '#e74c3c', marginTop:0}}>{resultado.exito ? '¡Pago Exitoso!' : 'Error'}</h2>
                        <p style={{color:'#ccc'}}>{resultado.exito ? 'Tu suscripción está activa.' : resultado.mensaje}</p>
                        {resultado.exito && (
                            <div style={{background: '#111', padding: '15px', borderRadius: '5px', textAlign: 'left', margin: '20px 0', fontSize:'0.9rem'}}>
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