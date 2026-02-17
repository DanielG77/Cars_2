-- Create enum for claimant status
DO $$ BEGIN
    CREATE TYPE estado_resolucion AS ENUM ('pendiente', 'en_tramite', 'resuelto', 'rechazado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado estado_resolucion DEFAULT 'pendiente'
);

-- Table Vehiculos
CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio_matriculacion INTEGER,
    color VARCHAR(30),
    puertas INTEGER,
    observaciones TEXT
);

-- Table Incidencias (NUEVA: Para cumplir con el punto 3.3 Gestionar incidencias)
CREATE TABLE IF NOT EXISTS incidencias (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resuelta BOOLEAN DEFAULT FALSE
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_clientes_dni ON clientes(dni);
CREATE INDEX IF NOT EXISTS idx_vehiculos_matricula ON vehiculos(matricula);
CREATE INDEX IF NOT EXISTS idx_vehiculos_cliente_id ON vehiculos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_cliente_id ON incidencias(cliente_id);
