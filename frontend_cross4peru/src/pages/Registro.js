import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Para redirigir al usuario
import '../App.css';

const Registro = () => {
    const navigate = useNavigate();
    
    // Estado para guardar los datos del formulario
    const [formData, setFormData] = useState({
        nombre_completo: '',
        correo: '',
        password: '',
        telefono: ''
    });

    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    // Función que maneja los cambios en los inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Función para enviar el formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita que se recargue la página
        setMensaje(null);
        setError(null);

        try {
            // Enviamos los datos al Backend
            const respuesta = await axios.post('http://localhost:3001/api/register', formData);
            
            setMensaje(respuesta.data.mensaje);
            
            // Si todo sale bien, esperamos 2 segundos y lo mandamos al Login
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            // Si hay error, mostramos el mensaje del backend (ej: "Correo ya registrado")
            if (err.response && err.response.data) {
                setError(err.response.data.mensaje);
            } else {
                setError('Error al conectar con el servidor.');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Únete a Cross4Perú</h2>
                <p>Crea tu cuenta para acceder a los planes y reservas.</p>

                {mensaje && <div className="alert success">{mensaje}</div>}
                {error && <div className="alert error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <input 
                            type="text" 
                            name="nombre_completo" 
                            value={formData.nombre_completo} 
                            onChange={handleChange} 
                            required 
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            name="correo" 
                            value={formData.correo} 
                            onChange={handleChange} 
                            required 
                            placeholder="ejemplo@correo.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Teléfono</label>
                        <input 
                            type="text" 
                            name="telefono" 
                            value={formData.telefono} 
                            onChange={handleChange} 
                            required 
                            placeholder="999 999 999"
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            placeholder="******"
                        />
                    </div>

                    <button type="submit" className="btn-primary full-width">Registrarme</button>
                </form>
                
                <p className="auth-footer">
                    ¿Ya tienes cuenta? <a href="/login">Inicia Sesión aquí</a>
                </p>
            </div>
        </div>
    );
};

export default Registro;