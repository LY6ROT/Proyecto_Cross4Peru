import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Importamos el contexto
import '../App.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Sacamos la función 'login' del contexto
    
    const [formData, setFormData] = useState({
        correo: '',
        password: ''
    });

    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // 1. Petición al Backend
            const respuesta = await axios.post('http://localhost:3001/api/login', formData);
            
            // 2. Si es exitoso, el backend nos devuelve el token y los datos del usuario
            const { token, usuario } = respuesta.data;

            // 3. Guardamos la sesión usando la función del AuthContext
            login(usuario, token);

            // 4. Redirigimos
            // Si es admin (rol 1), podríamos mandarlo al panel admin. Si es socio (rol 2), a Mi Cuenta.
            if (usuario.rol_id === 1) {
                navigate('/admin'); 
            } else {
                navigate('/mi-cuenta');
            }

        } catch (err) {
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
                <h2>Bienvenido de nuevo</h2>
                <p>Ingresa tus credenciales para acceder.</p>

                {error && <div className="alert error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            name="correo" 
                            value={formData.correo} 
                            onChange={handleChange} 
                            required 
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
                        />
                    </div>

                    <button type="submit" className="btn-primary full-width">Ingresar</button>
                </form>
                
                <p className="auth-footer">
                    ¿No tienes cuenta? <a href="/registro">Regístrate aquí</a>
                </p>
            </div>
        </div>
    );
};

export default Login;