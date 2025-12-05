const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Listar Clientes
router.get('/admin/clientes', async (req, res) => {
    try {
        const [clientes] = await db.query(`
            SELECT 
                c.id, c.nombre_completo, c.correo, c.telefono,
                (SELECT estado FROM Inscripciones WHERE cliente_id = c.id ORDER BY id DESC LIMIT 1) as estado_plan,
                (SELECT nombre FROM Planes WHERE id = (SELECT plan_id FROM Inscripciones WHERE cliente_id = c.id ORDER BY id DESC LIMIT 1)) as nombre_plan,
                (SELECT precio FROM Planes WHERE id = (SELECT plan_id FROM Inscripciones WHERE cliente_id = c.id ORDER BY id DESC LIMIT 1)) as precio_plan,
                (SELECT id FROM Inscripciones WHERE cliente_id = c.id ORDER BY id DESC LIMIT 1) as inscripcion_id
            FROM Cliente c
            WHERE c.rol_id = 2
        `);
        res.json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener clientes' });
    }
});

// 2. Registrar Pago en Efectivo (Manual)
router.post('/admin/pagos/efectivo', async (req, res) => {
    try {
        const { cliente_id, inscripcion_id, monto } = req.body;
        const TIPO_PAGO_EFECTIVO = 2; // ID 2 = Efectivo

        if (!inscripcion_id) {
            return res.status(400).json({ mensaje: 'El usuario no tiene inscripción.' });
        }

        // Insertar en BOLETA (Antes Pagos)
        const [boleta] = await db.query(
            "INSERT INTO Boleta (cliente_id, inscripcion_id, monto, tipo_pago_id, codigo_transaccion, estado) VALUES (?, ?, ?, ?, 'PAGO-FISICO', 'exitoso')",
            [cliente_id, inscripcion_id, monto, TIPO_PAGO_EFECTIVO]
        );

        // Activar Inscripción
        await db.query(`
            UPDATE Inscripciones 
            SET estado = 'activo', 
                fecha_fin = DATE_ADD(COALESCE(fecha_inicio_programada, CURRENT_DATE), INTERVAL 30 DAY)
            WHERE id = ?
        `, [inscripcion_id]);

        // Insertar DETALLE BOLETA (Antes Comprobantes)
        const correlativo = String(boleta.insertId).padStart(7, '0');
        await db.query(
            "INSERT INTO Detalle_Boleta (boleta_id, serie, numero_boleta) VALUES (?, ?, ?)",
            [boleta.insertId, 'F001', correlativo]
        );

        res.json({ mensaje: 'Pago en efectivo registrado.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar pago.' });
    }
});

// 3. Marcar Asistencia Manual
router.post('/admin/asistencia', async (req, res) => {
    try {
        const { cliente_id, fecha } = req.body;
        const fechaRegistro = fecha || new Date().toISOString().split('T')[0];

        const [existente] = await db.query(
            "SELECT id FROM Asistencias WHERE cliente_id = ? AND fecha = ?", 
            [cliente_id, fechaRegistro]
        );

        if (existente.length > 0) {
            return res.status(400).json({ mensaje: 'Ya tiene asistencia marcada hoy.' });
        }

        await db.query(
            "INSERT INTO Asistencias (cliente_id, fecha, hora_entrada, estado) VALUES (?, ?, CURRENT_TIME, 'asistio')", 
            [cliente_id, fechaRegistro]
        );
        
        res.json({ mensaje: 'Asistencia registrada ✅' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al marcar asistencia.' });
    }
});

// 4. Historial Admin
router.get('/admin/historial/:cliente_id', async (req, res) => {
    try {
        const { cliente_id } = req.params;
        const [historial] = await db.query(`
            SELECT id, fecha, hora_entrada, estado 
            FROM Asistencias 
            WHERE cliente_id = ? 
            ORDER BY fecha DESC
        `, [cliente_id]);
        res.json(historial);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error historial' });
    }
});

module.exports = router;