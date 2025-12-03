const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Verificar si el usuario puede marcar asistencia hoy
router.get('/asistencia/estado/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        // Fecha de hoy en formato YYYY-MM-DD
        const hoy = new Date().toISOString().split('T')[0];

        // A. Buscar si tiene un plan VÁLIDO PARA HOY
        // (Activo + No ha vencido + YA EMPEZÓ)
        const [planHoy] = await db.query(`
            SELECT id 
            FROM inscripciones 
            WHERE usuario_id = ? 
            AND estado = 'activo' 
            AND fecha_fin >= ? 
            AND fecha_inicio_programada <= ?
            LIMIT 1
        `, [usuario_id, hoy, hoy]);

        if (planHoy.length > 0) {
            // Sí tiene plan para hoy. Ahora revisamos si YA marcó hoy.
            const [asistenciaHoy] = await db.query(`
                SELECT hora_entrada FROM asistencias 
                WHERE usuario_id = ? AND fecha = ?
            `, [usuario_id, hoy]);

            if (asistenciaHoy.length > 0) {
                return res.json({ 
                    puede_marcar: false, 
                    motivo: 'ya_marco', 
                    hora: asistenciaHoy[0].hora_entrada 
                });
            }
            // Todo limpio: Puede entrar
            return res.json({ puede_marcar: true });
        }

        // --- SI LLEGAMOS AQUÍ, NO PUEDE MARCAR. AVERIGUAMOS POR QUÉ ---

        // B. ¿Tiene un plan que empieza en el FUTURO?
        const [planFuturo] = await db.query(`
            SELECT fecha_inicio_programada 
            FROM inscripciones 
            WHERE usuario_id = ? AND estado = 'activo' AND fecha_inicio_programada > ?
            LIMIT 1
        `, [usuario_id, hoy]);

        if (planFuturo.length > 0) {
            return res.json({ 
                puede_marcar: false, 
                motivo: 'plan_futuro', 
                fecha_inicio: planFuturo[0].fecha_inicio_programada 
            });
        }

        // C. ¿Tiene deuda pendiente?
        const [deuda] = await db.query(`
            SELECT id FROM inscripciones WHERE usuario_id = ? AND estado = 'pendiente_pago'
        `, [usuario_id]);

        if (deuda.length > 0) {
            return res.json({ puede_marcar: false, motivo: 'pendiente_pago' });
        }

        // D. No tiene nada
        res.json({ puede_marcar: false, motivo: 'sin_plan' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al verificar estado' });
    }
});

// 2. Registrar la Asistencia
router.post('/asistencia/marcar', async (req, res) => {
    try {
        const { usuario_id } = req.body;
        
        await db.query(`
            INSERT INTO asistencias (usuario_id, fecha, hora_entrada, estado) 
            VALUES (?, CURRENT_DATE, CURRENT_TIME, 'asistio')
        `, [usuario_id]);

        res.json({ mensaje: '¡Asistencia registrada correctamente! A entrenar 💪' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al marcar asistencia' });
    }
});

// 3. Obtener Historial
router.get('/asistencia/historial/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const [historial] = await db.query(`
            SELECT id, fecha, hora_entrada, estado 
            FROM asistencias 
            WHERE usuario_id = ? 
            ORDER BY fecha DESC, hora_entrada DESC
        `, [usuario_id]);

        res.json(historial);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener historial' });
    }
});

module.exports = router;