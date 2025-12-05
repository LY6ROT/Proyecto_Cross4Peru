// Archivo: backend_cross4peru/routes/pagos.routes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. OBTENER HISTORIAL DE BOLETAS Y PLANES PENDIENTES
router.get('/pagos/:cliente_id', async (req, res) => {
    try {
        const { cliente_id } = req.params;

        // A. Inscripciones pendientes
        const [pendientes] = await db.query(`
            SELECT i.id, i.fecha_inicio_programada, p.nombre, p.precio, p.id as plan_id
            FROM Inscripciones i
            JOIN Planes p ON i.plan_id = p.id
            WHERE i.cliente_id = ? AND i.estado = 'pendiente_pago'
            LIMIT 1
        `, [cliente_id]);

        // B. Historial de Boletas (JOIN con Tipo_De_Pago y Detalle_Boleta)
        const [historial] = await db.query(`
            SELECT b.id, b.monto, b.fecha_emision as fecha_pago, b.codigo_transaccion, 
                   tp.nombre as metodo_pago,
                   db.serie, db.numero_boleta as numero_correlativo, p.nombre as nombre_plan
            FROM Boleta b
            JOIN Inscripciones i ON b.inscripcion_id = i.id
            JOIN Planes p ON i.plan_id = p.id
            JOIN Tipo_De_Pago tp ON b.tipo_pago_id = tp.id
            LEFT JOIN Detalle_Boleta db ON db.boleta_id = b.id
            WHERE b.cliente_id = ? AND b.estado = 'exitoso'
            ORDER BY b.fecha_emision DESC
        `, [cliente_id]);

        res.json({
            pendiente: pendientes.length > 0 ? pendientes[0] : null,
            historial: historial
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cargar pagos' });
    }
});

// 2. CREAR INSCRIPCIÓN (Recibe usuario_id del frontend, lo usamos como cliente_id)
router.post('/inscripciones', async (req, res) => {
    try {
        const { usuario_id, plan_id, fecha_inicio } = req.body;
        // Mapeamos usuario_id (frontend) -> cliente_id (base de datos)
        const cliente_id = usuario_id; 

        const [existente] = await db.query(
            "SELECT id FROM Inscripciones WHERE cliente_id = ? AND estado = 'pendiente_pago'", 
            [cliente_id]
        );

        if (existente.length > 0) {
            await db.query(
                "UPDATE Inscripciones SET plan_id = ?, fecha_inicio_programada = ? WHERE id = ?",
                [plan_id, fecha_inicio, existente[0].id]
            );
            return res.json({ mensaje: 'Inscripción actualizada', inscripcion_id: existente[0].id });
        }

        const [result] = await db.query(
            "INSERT INTO Inscripciones (cliente_id, plan_id, fecha_inicio_programada, estado) VALUES (?, ?, ?, 'pendiente_pago')",
            [cliente_id, plan_id, fecha_inicio]
        );

        res.json({ mensaje: 'Inscripción creada', inscripcion_id: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear inscripción' });
    }
});

// 3. PROCESAR PAGO (WEB)
router.post('/pagos/procesar', async (req, res) => {
    try {
        const { usuario_id, inscripcion_id, monto, tarjeta } = req.body;
        const cliente_id = usuario_id;
        
        // Pago WEB siempre es TARJETA (ID 1 en tabla Tipo_De_Pago)
        const TIPO_PAGO_TARJETA = 1;

        const esExitoso = !tarjeta.numero.endsWith('0000'); 
        const estadoPago = esExitoso ? 'exitoso' : 'fallido';
        const codigoTrx = 'TRX-' + Date.now();

        // Insertar en BOLETA
        const [boletaResult] = await db.query(
            "INSERT INTO Boleta (cliente_id, inscripcion_id, monto, tipo_pago_id, codigo_transaccion, estado) VALUES (?, ?, ?, ?, ?, ?)",
            [cliente_id, inscripcion_id, monto, TIPO_PAGO_TARJETA, codigoTrx, estadoPago]
        );

        if (!esExitoso) {
            return res.status(400).json({ mensaje: 'La transacción fue rechazada por el banco.' });
        }

        // Activar Plan
        await db.query(`
            UPDATE Inscripciones 
            SET estado = 'activo', fecha_fin = DATE_ADD(fecha_inicio_programada, INTERVAL 30 DAY)
            WHERE id = ?
        `, [inscripcion_id]);

        const serie = 'B001';
        const correlativo = String(boletaResult.insertId).padStart(7, '0');

        // Insertar en DETALLE_BOLETA (Sin DNI)
        await db.query(
            "INSERT INTO Detalle_Boleta (boleta_id, serie, numero_boleta) VALUES (?, ?, ?)",
            [boletaResult.insertId, serie, correlativo]
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