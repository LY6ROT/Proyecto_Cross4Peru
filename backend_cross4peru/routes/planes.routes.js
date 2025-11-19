// Archivo: backend_cross4peru/routes/planes.routes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los planes (Rookie, Atleta, PRO)
router.get('/planes', async (req, res) => {
    try {
        const [planes] = await db.query('SELECT * FROM Planes');
        res.json(planes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener planes' });
    }
});

module.exports = router;