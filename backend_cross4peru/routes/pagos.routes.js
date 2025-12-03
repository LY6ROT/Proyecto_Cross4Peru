const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. OBTENER HISTORIAL DE PAGOS Y PLANES PENDIENTES
router.get('/pagos/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;

        // A. Buscar si tiene alguna inscripción pendiente de pago
        // (Corregido: tablas en minúsculas)
        const [pendientes] = await db.query(`
            SELECT i.id, i.fecha_inicio_programada, p.nombre, p.precio, p.id as plan_id
            FROM inscripciones i
            JOIN planes p ON i.plan_id = p.id
            WHERE i.usuario_id = ? AND i.estado = 'pendiente_pago'
            LIMIT 1
        `, [usuario_id]);

        // B. Buscar historial de pagos exitosos
        // (Corregido: tablas en minúsculas)
        const [historial] = await db.query(`
            SELECT pg.id, pg.monto, pg.fecha_pago, pg.codigo_transaccion, pg.metodo_pago,
                   c.serie, c.numero_correlativo, p.nombre as nombre_plan
            FROM pagos pg
            JOIN inscripciones i ON pg.inscripcion_id = i.id
            JOIN planes p ON i.plan_id = p.id
            LEFT JOIN comprobantes c ON c.pago_id = pg.id
            WHERE pg.usuario_id = ? AND pg.estado = 'exitoso'
            ORDER BY pg.fecha_pago DESC
        `, [usuario_id]);

        res.json({
            pendiente: pendientes.length > 0 ? pendientes[0] : null,
            historial: historial
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cargar pagos' });
    }
});

// 2. CREAR UNA NUEVA INSCRIPCIÓN
router.post('/inscripciones', async (req, res) => {
    try {
        const { usuario_id, plan_id, fecha_inicio } = req.body;

        const [existente] = await db.query(
            "SELECT id FROM inscripciones WHERE usuario_id = ? AND estado = 'pendiente_pago'", 
            [usuario_id]
        );

        if (existente.length > 0) {
            await db.query(
                "UPDATE inscripciones SET plan_id = ?, fecha_inicio_programada = ? WHERE id = ?",
                [plan_id, fecha_inicio, existente[0].id]
            );
            return res.json({ mensaje: 'Inscripción actualizada', inscripcion_id: existente[0].id });
        }

        const [result] = await db.query(
            "INSERT INTO inscripciones (usuario_id, plan_id, fecha_inicio_programada, estado) VALUES (?, ?, ?, 'pendiente_pago')",
            [usuario_id, plan_id, fecha_inicio]
        );

        res.json({ mensaje: 'Inscripción creada', inscripcion_id: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear inscripción' });
    }
});

// 3. PROCESAR EL PAGO
router.post('/pagos/procesar', async (req, res) => {
    try {
        const { usuario_id, inscripcion_id, monto, metodo_pago, tarjeta } = req.body;

        const esExitoso = !tarjeta.numero.endsWith('0000'); 
        const estadoPago = esExitoso ? 'exitoso' : 'fallido';
        const codigoTrx = 'TRX-' + Date.now();

        // (Corregido: INSERT en tabla 'pagos' minúscula)
        const [pagoResult] = await db.query(
            "INSERT INTO pagos (usuario_id, inscripcion_id, monto, metodo_pago, codigo_transaccion, estado) VALUES (?, ?, ?, ?, ?, ?)",
            [usuario_id, inscripcion_id, monto, metodo_pago, codigoTrx, estadoPago]
        );

        if (!esExitoso) {
            return res.status(400).json({ mensaje: 'La transacción fue rechazada por el banco.' });
        }

        await db.query(`
            UPDATE inscripciones 
            SET estado = 'activo', fecha_fin = DATE_ADD(fecha_inicio_programada, INTERVAL 30 DAY)
            WHERE id = ?
        `, [inscripcion_id]);

        const serie = 'B001';
        const correlativo = String(pagoResult.insertId).padStart(7, '0');

        // (Corregido: INSERT en tabla 'comprobantes' minúscula)
        await db.query(
            "INSERT INTO comprobantes (pago_id, serie, numero_correlativo, ruc_dni_cliente) VALUES (?, ?, ?, ?)",
            [pagoResult.insertId, serie, correlativo, '00000000']
        );

        res.json({ 
            mensaje: '¡Pago realizado con éxito!', 
            comprobante: { serie, correlativo, monto, codigoTrx }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al procesar el pago' });
    }
});

module.exports = router;