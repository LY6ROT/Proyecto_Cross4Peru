// Archivo: backend_cross4peru/index.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

// Importar las rutas
const authRoutes = require('./routes/auth.routes');
const planesRoutes = require('./routes/planes.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const pagosRoutes = require('./routes/pagos.routes');
const asistenciasRoutes = require('./routes/asistencias.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARES ---
app.use(cors()); // Permite conectar con React
app.use(express.json()); // Permite leer JSON

// --- RUTAS ---
app.get('/', (req, res) => {
    res.send('¡Servidor de Cross4Peru funcionando correctamente!');
});

// Rutas de la API
app.use('/api', authRoutes);
app.use('/api', planesRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', pagosRoutes);
app.use('/api', asistenciasRoutes);
app.use('/api', adminRoutes);

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});