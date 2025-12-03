import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// --- IMPORTACIONES DE PÁGINAS ---
import Inicio from './pages/Inicio';
import Planes from './pages/Planes';
import Registro from './pages/Registro';
import Login from './pages/Login';
import MiCuenta from './pages/MiCuenta';
import Pagos from './pages/Pagos';
import Asistencia from './pages/Asistencia';
import Admin from './pages/Admin'; // <--- NUEVA IMPORTACIÓN

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Inicio />} />
            <Route path="/planes" element={<Planes />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rutas Privadas */}
            <Route path="/mi-cuenta" element={<MiCuenta />} />
            <Route path="/pagos" element={<Pagos />} />
            <Route path="/asistencia" element={<Asistencia />} />

            {/* Ruta de Administrador */}
            <Route path="/admin" element={<Admin />} /> 
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;