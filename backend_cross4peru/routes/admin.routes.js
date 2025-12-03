// Archivo: backend_cross4peru/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Listar Clientes con su estado actual
router.get('/admin/clientes', async (req, res) => {
    try {
        // Seleccionamos usuarios que sean Socios (rol_id = 2)
        // Y hacemos subconsultas para ver su último plan y estado
        const [clientes] = await db.query(`
            SELECT 
                u.id, 
                u.nombre_completo, 
                u.correo, 
                u.telefono,
                (SELECT estado FROM Inscripciones WHERE usuario_id = u.id ORDER BY id DESC LIMIT 1) as estado_plan,
                (SELECT nombre FROM Planes WHERE id = (SELECT plan_id FROM Inscripciones WHERE usuario_id = u.id ORDER BY id DESC LIMIT 1)) as nombre_plan,
                (SELECT precio FROM Planes WHERE id = (SELECT plan_id FROM Inscripciones WHERE usuario_id = u.id ORDER BY id DESC LIMIT 1)) as precio_plan,
                (SELECT id FROM Inscripciones WHERE usuario_id = u.id ORDER BY id DESC LIMIT 1) as inscripcion_id
            FROM Usuarios u
            WHERE u.rol_id = 2
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
        const { usuario_id, inscripcion_id, monto } = req.body;

        if (!inscripcion_id) {
            return res.status(400).json({ mensaje: 'El usuario no tiene una inscripción para pagar.' });
        }

        // A. Insertar el Pago en BD como 'efectivo'
        const [pago] = await db.query(
            "INSERT INTO Pagos (usuario_id, inscripcion_id, monto, metodo_pago, codigo_transaccion, estado) VALUES (?, ?, ?, 'efectivo', 'PAGO-FISICO', 'exitoso')",
            [usuario_id, inscripcion_id, monto]
        );

        // B. Activar la inscripción (+30 días desde HOY o desde la fecha programada)
        await db.query(`
            UPDATE Inscripciones 
            SET estado = 'activo', 
                fecha_fin = DATE_ADD(COALESCE(fecha_inicio_programada, CURRENT_DATE), INTERVAL 30 DAY)
            WHERE id = ?
        `, [inscripcion_id]);

        // C. Generar Comprobante (Físico)
        const correlativo = String(pago.insertId).padStart(7, '0');
        await db.query(
            "INSERT INTO Comprobantes (pago_id, serie, numero_correlativo, ruc_dni_cliente) VALUES (?, ?, ?, ?)",
            [pago.insertId, 'F001', correlativo, '99999999'] 
        );

        res.json({ mensaje: 'Pago en efectivo registrado y plan activado.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar pago.' });
    }
});

// 3. Marcar Asistencia Manual (Por el Admin) - Acepta fecha específica
router.post('/admin/asistencia', async (req, res) => {
    try {
        // Ahora recibimos la FECHA también
        const { usuario_id, fecha } = req.body; 
        
        // Si no mandan fecha, usamos la de hoy. Si mandan, usamos esa.
        const fechaRegistro = fecha || new Date().toISOString().split('T')[0];
        const horaRegistro = new Date().toLocaleTimeString('es-PE', { hour12: false });

        // Evitar duplicados en el mismo día
        const [existente] = await db.query(
            "SELECT id FROM asistencias WHERE usuario_id = ? AND fecha = ?", 
            [usuario_id, fechaRegistro]
        );

        if (existente.length > 0) {
            return res.status(400).json({ mensaje: 'Este usuario ya tiene asistencia marcada en esa fecha.' });
        }

        await db.query(`
            INSERT INTO asistencias (usuario_id, fecha, hora_entrada, estado) 
            VALUES (?, ?, ?, 'asistio')
        `, [usuario_id, fechaRegistro, horaRegistro]);
        
        res.json({ mensaje: 'Asistencia registrada ✅' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al marcar asistencia.' });
    }
});

// 4. (NUEVO) Obtener historial de asistencia de UN usuario para el Admin
router.get('/admin/historial/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const [historial] = await db.query(`
            SELECT id, fecha, hora_entrada, estado 
            FROM asistencias 
            WHERE usuario_id = ? 
            ORDER BY fecha DESC
        `, [usuario_id]);
        res.json(historial);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al cargar historial' });
    }
});

module.exports = router;