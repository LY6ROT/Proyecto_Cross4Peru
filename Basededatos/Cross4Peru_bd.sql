-- 1. Crear la Base de Datos
CREATE DATABASE IF NOT EXISTS cross4peru_db;
USE cross4peru_db;

-- 2. Tabla de Roles (Buenas prácticas)
CREATE TABLE IF NOT EXISTS Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE -- Ej: 'admin', 'socio', 'nuevo_cliente'
);

-- 3. Tabla de Usuarios (Actores: Cliente, Socio, Admin)
CREATE TABLE IF NOT EXISTS Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Se almacenará encriptada (bcrypt)
    telefono VARCHAR(20),
    rol_id INT NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES Roles(id)
);

-- 4. Tabla de Planes (Rookie, Atleta, PRO)
CREATE TABLE IF NOT EXISTS Planes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    beneficios TEXT -- Para listar lo que incluye (Nutrición, etc.)
);

-- 5. Tabla de Inscripciones (Vincula Usuario con Plan)
CREATE TABLE IF NOT EXISTS Inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    plan_id INT NOT NULL,
    fecha_inicio_programada DATE NOT NULL, -- El usuario puede elegir iniciar "hoy" o "futuro"
    fecha_fin DATE, -- Se calcula base a la duración (ej. 30 días)
    estado ENUM('activo', 'pendiente_pago', 'vencido', 'inactivo') DEFAULT 'pendiente_pago',
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id),
    FOREIGN KEY (plan_id) REFERENCES Planes(id)
);

-- 6. Tabla de Pagos (Historial y validación)
CREATE TABLE IF NOT EXISTS Pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    inscripcion_id INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    metodo_pago ENUM('tarjeta', 'efectivo_fisico') NOT NULL,
    codigo_transaccion VARCHAR(100), -- Para simulación de tarjeta o recibo físico
    estado ENUM('exitoso', 'fallido') DEFAULT 'exitoso',
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id),
    FOREIGN KEY (inscripcion_id) REFERENCES Inscripciones(id)
);

-- 7. Tabla de Asistencia (Control de entrada)
CREATE TABLE IF NOT EXISTS Asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    estado ENUM('asistio', 'falta_justificada') DEFAULT 'asistio',
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

-- 8. NUEVA TABLA: Comprobantes (Lo que se muestra tras el pago exitoso)
-- Se genera SOLO si el pago en la tabla anterior fue 'exitoso'.
CREATE TABLE IF NOT EXISTS Comprobantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pago_id INT NOT NULL UNIQUE, -- Un pago genera un único comprobante
    tipo_comprobante ENUM('boleta', 'factura', 'recibo_interno') DEFAULT 'boleta',
    serie VARCHAR(10) NOT NULL, -- Ej: B001
    numero_correlativo VARCHAR(20) NOT NULL, -- Ej: 0000456 (Para control administrativo)
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    ruc_dni_cliente VARCHAR(20), -- Dato fiscal del cliente al momento del pago
    direccion_fiscal VARCHAR(255), -- Dato fiscal
    pdf_url VARCHAR(255), -- Si generas un PDF, aquí guardas el link (ej: /comprobantes/B001-456.pdf)
    FOREIGN KEY (pago_id) REFERENCES Pagos(id)
);


-- =======================================================
-- DATOS DE PRUEBA (SEEDING)
-- =======================================================

-- A. Insertar Roles
INSERT INTO Roles (nombre) VALUES ('administrador'), ('socio');

-- B. Insertar Planes (Precios según tu indicación)
INSERT INTO Planes (nombre, precio, descripcion) VALUES 
('Plan Rookie', 69.90, 'Ingreso al gym y registro de asistencia.'),
('Plan Atleta', 99.90, 'Ingreso al gym, asistencia + Plan de alimentación.'),
('Plan PRO', 119.90, 'Todo lo anterior + Asesoría personalizada y suplementación.');

-- C. Insertar Usuarios 
-- NOTA: Las contraseñas aquí son "123456" pero hasheadas con Bcrypt para que funcionen con tu backend Node.js
-- Hash de "123456" = $2b$10$5u5.pp.1.jO/N6i/d.sVO.f.v.X/M.s.1.jO/N6i/d.sVO.f.v.X (Simulado para el ejemplo, el backend lo generará real)

-- 1. Administrador
INSERT INTO Usuarios (nombre_completo, correo, password, telefono, rol_id) VALUES 
('Admin Cross4Peru', 'admin@cross4peru.com', '$2b$10$ExampleHashFor123456.............', '999888777', 1);

-- 2. Usuario Plan Rookie
INSERT INTO Usuarios (nombre_completo, correo, password, telefono, rol_id) VALUES 
('Juan Rookie', 'juan@gmail.com', '$2b$10$ExampleHashFor123456.............', '900111222', 2);

-- 3. Usuario Plan Atleta
INSERT INTO Usuarios (nombre_completo, correo, password, telefono, rol_id) VALUES 
('Maria Atleta', 'maria@gmail.com', '$2b$10$ExampleHashFor123456.............', '900333444', 2);

-- 4. Usuario Plan PRO
INSERT INTO Usuarios (nombre_completo, correo, password, telefono, rol_id) VALUES 
('Carlos Pro', 'carlos@gmail.com', '$2b$10$ExampleHashFor123456.............', '900555666', 2);

-- D. Insertar Inscripciones Activas (Para probar que ya tienen plan)
INSERT INTO Inscripciones (usuario_id, plan_id, fecha_inicio_programada, fecha_fin, estado) VALUES 
(2, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'activo'), -- Juan (Rookie)
(3, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'activo'), -- Maria (Atleta)
(4, 3, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'activo'); -- Carlos (Pro)

-- E. Insertar Historial de Pagos (Simulados)
INSERT INTO Pagos (usuario_id, inscripcion_id, monto, metodo_pago, codigo_transaccion) VALUES 
(2, 1, 69.90, 'tarjeta', 'TRX-001-ROOKIE'),
(3, 2, 99.90, 'tarjeta', 'TRX-002-ATLETA'),
(4, 3, 119.90, 'efectivo_fisico', 'RECIBO-FISICO-001');

-- Insertamos los Comprobantes (Solo para los pagos exitosos)
INSERT INTO Comprobantes (pago_id, tipo_comprobante, serie, numero_correlativo, ruc_dni_cliente) VALUES 
(1, 'boleta', 'B001', '0000001', '45454545'), -- Comprobante del primer pago
(3, 'boleta', 'B001', '0000002', '45454545'); -- Comprobante del segundo pago exitoso

-- Pa ver usuarios
SELECT * FROM usuarios;

-- Pa crear admins
-- Actualizar el rol del nuevo usuario para que sea Admin (rol_id = 1)
-- Reemplaza el correo con el que acabas de registrar
UPDATE usuarios 
SET rol_id = 1 
WHERE correo = 'administracion@cross4peru.com';

-- Pa ver usuarios
SELECT id, nombre_completo, correo, rol_id FROM usuarios
