
CREATE DATABASE cross4peru_db;
USE cross4peru_db;

-- 1. Tabla Roles
CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- 2. Tabla Cliente (Sin DNI)
CREATE TABLE Cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol_id INT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES Roles(id)
);

-- 3. Tabla Planes
CREATE TABLE Planes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    beneficios TEXT
);

-- 4. Tabla Inscripciones
CREATE TABLE Inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT, 
    plan_id INT,
    fecha_inicio_programada DATE,
    fecha_fin DATE,
    estado ENUM('pendiente_pago', 'activo', 'vencido', 'cancelado') DEFAULT 'pendiente_pago',
    FOREIGN KEY (cliente_id) REFERENCES Cliente(id),
    FOREIGN KEY (plan_id) REFERENCES Planes(id)
);

-- 5. Tabla Tipo_De_Pago (Solo Tarjeta y Efectivo)
CREATE TABLE Tipo_De_Pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL 
);

-- 6. Tabla Boleta
CREATE TABLE Boleta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    inscripcion_id INT,
    monto DECIMAL(10,2),
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP, 
    tipo_pago_id INT, 
    codigo_transaccion VARCHAR(100),
    estado ENUM('exitoso', 'fallido') DEFAULT 'exitoso',
    FOREIGN KEY (cliente_id) REFERENCES Cliente(id),
    FOREIGN KEY (inscripcion_id) REFERENCES Inscripciones(id),
    FOREIGN KEY (tipo_pago_id) REFERENCES Tipo_De_Pago(id)
);

-- 7. Tabla Detalle_Boleta
CREATE TABLE Detalle_Boleta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    boleta_id INT,
    serie VARCHAR(10),
    numero_boleta VARCHAR(20),
    pdf_url VARCHAR(255),
    FOREIGN KEY (boleta_id) REFERENCES Boleta(id)
);

-- 8. Tabla Asistencias
CREATE TABLE Asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    fecha DATE DEFAULT (CURRENT_DATE),
    hora_entrada TIME DEFAULT (CURRENT_TIME),
    estado ENUM('asistio', 'falta', 'justificado') DEFAULT 'asistio',
    FOREIGN KEY (cliente_id) REFERENCES Cliente(id)
);

-- ==========================================
-- DATOS INICIALES (SEMILLA)
-- ==========================================

-- A. Insertar Roles ('administrador' y 'cliente' en minúsculas para coincidir con tu lógica)
INSERT INTO Roles (nombre) VALUES ('administrador'), ('cliente');

-- B. Insertar Planes
INSERT INTO Planes (nombre, precio, descripcion) VALUES 
('Plan Rookie', 69.90, 'Ingreso al gym y registro de asistencia.'),
('Plan Atleta', 99.90, 'Ingreso al gym, asistencia + Plan de alimentación.'),
('Plan PRO', 119.90, 'Todo lo anterior + Asesoría personalizada y suplementación.');

-- C. Insertar Tipos de Pago (SOLO LOS DOS QUE PEDISTE)
INSERT INTO Tipo_De_Pago (nombre) VALUES ('Tarjeta'), ('Efectivo');


SELECT * FROM usuarios;


-- Pa ver usuarios
SELECT id, nombre_completo, correo, rol_id 
FROM Cliente;


-- Actualizar a ROL 1 (Administrador)
UPDATE Cliente 
SET rol_id = 1 
WHERE correo = 'administracion@cross4peru.com'; 
