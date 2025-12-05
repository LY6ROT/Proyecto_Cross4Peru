// Archivo: backend_cross4peru/routes/usuarios.routes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener perfil de cliente y su plan activo
router.get('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Buscamos datos personales en Cliente (Sin DNI)
        const [clientes] = await db.query(
            'SELECT id, nombre_completo, correo, telefono, rol_id, fecha_registro FROM Cliente WHERE id = ?',
            [id]
        );

        if (clientes.length === 0) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        // 2. Buscamos si tiene un plan ACTIVO
        const [inscripciones] = await db.query(`
            SELECT i.fecha_inicio_programada, i.fecha_fin, i.estado, p.nombre as nombre_plan, p.precio 
            FROM Inscripciones i
            JOIN Planes p ON i.plan_id = p.id
            WHERE i.cliente_id = ? AND i.estado = 'activo'
            LIMIT 1
        `, [id]);

        // 3. Enviamos todo junto
        res.json({
            usuario: clientes[0],
            plan: inscripciones.length > 0 ? inscripciones[0] : null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener perfil' });
    }
});

module.exports = router;