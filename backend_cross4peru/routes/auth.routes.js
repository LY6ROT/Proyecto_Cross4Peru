// Archivo: backend_cross4peru/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); 
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 

// REGISTRO
router.post('/register', async (req, res) => {
    try {
        const { nombre_completo, correo, password, telefono } = req.body;

        if (!nombre_completo || !correo || !password) {
            return res.status(400).json({ mensaje: 'Faltan datos obligatorios.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Rol 2 = Cliente
        const rol_id = 2; 

        // Insertar en tabla Cliente (Sin DNI)
        const [resultado] = await db.query(
            'INSERT INTO Cliente (nombre_completo, correo, password, telefono, rol_id) VALUES (?, ?, ?, ?, ?)',
            [nombre_completo, correo, passwordHash, telefono, rol_id]
        );

        res.status(201).json({ 
            mensaje: '¡Usuario registrado exitosamente!',
            usuarioId: resultado.insertId
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
        }
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor.' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Buscar en tabla Cliente
        const [usuarios] = await db.query('SELECT * FROM Cliente WHERE correo = ?', [correo]);

        if (usuarios.length === 0) {
            return res.status(400).json({ mensaje: 'Credenciales incorrectas.' });
        }

        const usuario = usuarios[0];

        const passValido = await bcrypt.compare(password, usuario.password);
        if (!passValido) {
            return res.status(400).json({ mensaje: 'Credenciales incorrectas.' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol_id: usuario.rol_id },
            process.env.JWT_SECRET || 'secreto',
            { expiresIn: '2h' }
        );

        res.json({
            mensaje: 'Bienvenido',
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre_completo,
                rol_id: usuario.rol_id
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor.' });
    }
});

module.exports = router;