// Archivo: backend_cross4peru/routes/asistencias.routes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Verificar si el usuario puede marcar asistencia hoy
router.get('/asistencia/estado/:cliente_id', async (req, res) => {
    try {
        const { cliente_id } = req.params;
        const hoy = new Date().toISOString().split('T')[0];

        // A. Buscar si tiene un plan VÁLIDO PARA HOY
        const [planHoy] = await db.query(`
            SELECT id 
            FROM Inscripciones 
            WHERE cliente_id = ? 
            AND estado = 'activo' 
            AND fecha_fin >= ? 
            AND fecha_inicio_programada <= ?
            LIMIT 1
        `, [cliente_id, hoy, hoy]);

        if (planHoy.length > 0) {
            // Verificar si YA marcó hoy
            const [asistenciaHoy] = await db.query(`
                SELECT hora_entrada FROM Asistencias 
                WHERE cliente_id = ? AND fecha = ?
            `, [cliente_id, hoy]);

            if (asistenciaHoy.length > 0) {
                return res.json({ 
                    puede_marcar: false, 
                    motivo: 'ya_marco', 
                    hora: asistenciaHoy[0].hora_entrada 
                });
            }
            return res.json({ puede_marcar: true });
        }

        // B. ¿Plan Futuro?
        const [planFuturo] = await db.query(`
            SELECT fecha_inicio_programada 
            FROM Inscripciones 
            WHERE cliente_id = ? AND estado = 'activo' AND fecha_inicio_programada > ?
            LIMIT 1
        `, [cliente_id, hoy]);

        if (planFuturo.length > 0) {
            return res.json({ 
                puede_marcar: false, 
                motivo: 'plan_futuro', 
                fecha_inicio: planFuturo[0].fecha_inicio_programada 
            });
        }

        // C. ¿Deuda?
        const [deuda] = await db.query(`
            SELECT id FROM Inscripciones WHERE cliente_id = ? AND estado = 'pendiente_pago'
        `, [cliente_id]);

        if (deuda.length > 0) {
            return res.json({ puede_marcar: false, motivo: 'pendiente_pago' });
        }

        res.json({ puede_marcar: false, motivo: 'sin_plan' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al verificar estado' });
    }
});

// 2. Registrar la Asistencia (Ruta auxiliar, aunque el admin lo hace manual)
router.post('/asistencia/marcar', async (req, res) => {
    try {
        const { cliente_id } = req.body;
        
        await db.query(`
            INSERT INTO Asistencias (cliente_id, fecha, hora_entrada, estado) 
            VALUES (?, CURRENT_DATE, CURRENT_TIME, 'asistio')
        `, [cliente_id]);

        res.json({ mensaje: '¡Asistencia registrada correctamente!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al marcar asistencia' });
    }
});

// 3. Obtener Historial
router.get('/asistencia/historial/:cliente_id', async (req, res) => {
    try {
        const { cliente_id } = req.params;
        const [historial] = await db.query(`
            SELECT id, fecha, hora_entrada, estado 
            FROM Asistencias 
            WHERE cliente_id = ? 
            ORDER BY fecha DESC, hora_entrada DESC
        `, [cliente_id]);

        res.json(historial);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener historial' });
    }
});

module.exports = router;