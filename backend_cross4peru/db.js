const mysql = require('mysql2');
require('dotenv').config(); // Para leer las variables de entorno

// Configuración de la conexión
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Tu contraseña de MySQL Workbench
    database: process.env.DB_NAME || 'cross4peru_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convertir a promesas para poder usar async/await (más moderno y fácil)
const promisePool = pool.promise();

console.log("Configuración de BD cargada. Intentando conectar...");

module.exports = promisePool;