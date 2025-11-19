import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// --- IMPORTACIONES DE PÁGINAS ---
import Inicio from './pages/Inicio';
import Planes from './pages/Planes';
import Registro from './pages/Registro';
import Login from './pages/Login';
import MiCuenta from './pages/MiCuenta'; // <--- ¡ESTA ES LA LÍNEA QUE FALTABA!

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
            
            {/* Rutas Privadas (Solo usuarios logueados) */}
            <Route path="/mi-cuenta" element={<MiCuenta />} />

            {/* Placeholders para lo que haremos después */}
            <Route path="/pagos" element={<h1>Historial de Pagos</h1>} />
            <Route path="/asistencia" element={<h1>Control de Asistencia</h1>} />
            <Route path="/admin" element={<h1>Panel de Administrador</h1>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;